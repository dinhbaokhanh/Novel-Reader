import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChapterSource, ChapterStatus, VersionSource, Prisma } from '@prisma/client';
import type { Multer } from 'multer';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NovelsService } from '../novels/novels.service';
import { assertValidTransition, isEditable } from './chapter-state';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { ImportChaptersDto } from './dto/import-chapters.dto';
import { UpdateChapterContentDto } from './dto/update-chapter-content.dto';
import { countWords } from './helpers/word-count.helper';
import {
  parseMarkdownToChapters,
  parseTxtToChapters,
  parsePdfToChapters,
  type ChapterSegment,
} from './helpers/file-parser.helper';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly novelsService: NovelsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE (manual)
  // ─────────────────────────────────────────────────────────────────────────

  async create(novelId: string, userId: string, dto: CreateChapterDto) {
    await this.novelsService.assertOwner(novelId, userId);

    const chapterNumber = await this.resolveChapterNumber(novelId, dto.chapterNumber);
    const wordCount = countWords(dto.content);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const chapter = await tx.chapter.create({
        data: {
          novelId,
          chapterNumber,
          title: dto.title,
          content: dto.content,
          wordCount,
          summary: dto.summary,
          status: ChapterStatus.completed_locked,
          source: ChapterSource.manual,
        },
      });

      // BR-03: Always create version alongside chapter creation
      await tx.chapterVersion.create({
        data: {
          chapterId: chapter.id,
          versionNumber: 1,
          content: dto.content,
          wordCount,
          changeSummary: 'Initial version',
          createdById: userId,
          source: VersionSource.manual_edit,
        },
      });

      await tx.novel.update({
        where: { id: novelId },
        data: { chapterCount: { increment: 1 } },
      });

      return chapter;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────────────

  async findAll(novelId: string, userId: string) {
    await this.novelsService.assertOwner(novelId, userId);

    return this.prisma.chapter.findMany({
      where: { novelId },
      orderBy: { chapterNumber: 'asc' },
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        wordCount: true,
        status: true,
        source: true,
        isCanonDirty: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(chapterId: string, userId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        novel: { select: { ownerId: true, id: true } },
      },
    });

    if (!chapter) throw new NotFoundException('Chapter not found');
    if (chapter.novel.ownerId !== userId)
      throw new NotFoundException('Chapter not found'); // Don't leak existence

    return chapter;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE CONTENT (with versioning — BR-03)
  // ─────────────────────────────────────────────────────────────────────────

  async updateContent(
    chapterId: string,
    userId: string,
    dto: UpdateChapterContentDto,
  ) {
    const chapter = await this.findOne(chapterId, userId);

    // BR-01: Must be in editable state
    if (!isEditable(chapter.status)) {
      throw new BadRequestException(
        'Chapter must be unlocked before editing. Use PATCH /chapters/:id/unlock first.',
      );
    }

    const wordCount = countWords(dto.content);
    const nextVersion = await this.getNextVersionNumber(chapterId);

    // Find canon facts linked to this chapter — mark them dirty
    const linkedFactIds = await this.prisma.chapterCanonLink
      .findMany({
        where: { chapterId },
        select: { canonFactId: true },
      })
      .then((links) => links.map((l) => l.canonFactId));

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.chapter.update({
        where: { id: chapterId },
        data: {
          content: dto.content,
          wordCount,
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.summary !== undefined && { summary: dto.summary }),
        },
      });

      // BR-03: New version on every edit
      await tx.chapterVersion.create({
        data: {
          chapterId,
          versionNumber: nextVersion,
          content: dto.content,
          wordCount,
          changeSummary: dto.changeSummary,
          createdById: userId,
          source: VersionSource.manual_edit,
        },
      });

      // FR-10: Mark linked canon facts as dirty
      if (linkedFactIds.length > 0) {
        await tx.canonFact.updateMany({
          where: { id: { in: linkedFactIds } },
          data: { isDirty: true },
        });
      }

      // FR-10: Mark downstream chapters as canon-dirty
      await tx.chapter.updateMany({
        where: {
          novelId: chapter.novelId,
          chapterNumber: { gt: chapter.chapterNumber },
        },
        data: { isCanonDirty: true },
      });

      return {
        ...updated,
        newVersionNumber: nextVersion,
        dirtiedCanonCount: linkedFactIds.length,
      };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOCK / UNLOCK (BR-01 state machine)
  // ─────────────────────────────────────────────────────────────────────────

  async lock(chapterId: string, userId: string) {
    const chapter = await this.findOne(chapterId, userId);
    assertValidTransition(chapter.status, ChapterStatus.completed_locked);

    return this.prisma.chapter.update({
      where: { id: chapterId },
      data: { status: ChapterStatus.completed_locked },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  async unlock(chapterId: string, userId: string) {
    const chapter = await this.findOne(chapterId, userId);
    assertValidTransition(chapter.status, ChapterStatus.completed_editable);

    return this.prisma.chapter.update({
      where: { id: chapterId },
      data: { status: ChapterStatus.completed_editable },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE (permanent)
  // ─────────────────────────────────────────────────────────────────────────

  async remove(chapterId: string, userId: string) {
    const chapter = await this.findOne(chapterId, userId);

    // Only allow deletion when chapter is unlocked
    if (!isEditable(chapter.status)) {
      throw new BadRequestException(
        'Unlock the chapter before deleting it.',
      );
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete chapter (cascades to versions, canon links, bookmarks,
      // reading progress references via onDelete: Cascade in schema)
      await tx.chapter.delete({ where: { id: chapterId } });

      // Decrement novel chapter count
      await tx.novel.update({
        where: { id: chapter.novelId },
        data: { chapterCount: { decrement: 1 } },
      });
    });

    return { deleted: true };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERSIONS (FR-09)
  // ─────────────────────────────────────────────────────────────────────────

  async getVersions(chapterId: string, userId: string) {
    await this.findOne(chapterId, userId); // ownership check

    return this.prisma.chapterVersion.findMany({
      where: { chapterId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        wordCount: true,
        changeSummary: true,
        source: true,
        createdAt: true,
      },
    });
  }

  async getVersionContent(
    chapterId: string,
    versionId: string,
    userId: string,
  ) {
    await this.findOne(chapterId, userId); // ownership check

    const version = await this.prisma.chapterVersion.findFirst({
      where: { id: versionId, chapterId },
    });
    if (!version) throw new NotFoundException('Version not found');
    return version;
  }

  async restoreVersion(
    chapterId: string,
    versionId: string,
    userId: string,
  ) {
    const chapter = await this.findOne(chapterId, userId);

    // Allow restore only when editable (must unlock first)
    if (!isEditable(chapter.status)) {
      throw new BadRequestException(
        'Unlock the chapter before restoring a version.',
      );
    }

    const version = await this.prisma.chapterVersion.findFirst({
      where: { id: versionId, chapterId },
    });
    if (!version) throw new NotFoundException('Version not found');

    const nextVersion = await this.getNextVersionNumber(chapterId);

    const linkedFactIds = await this.prisma.chapterCanonLink
      .findMany({ where: { chapterId }, select: { canonFactId: true } })
      .then((l) => l.map((x) => x.canonFactId));

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.chapter.update({
        where: { id: chapterId },
        data: {
          content: version.content,
          wordCount: version.wordCount,
        },
      });

      await tx.chapterVersion.create({
        data: {
          chapterId,
          versionNumber: nextVersion,
          content: version.content,
          wordCount: version.wordCount,
          changeSummary: `Restored from v${version.versionNumber}`,
          createdById: userId,
          source: VersionSource.restored,
        },
      });

      if (linkedFactIds.length > 0) {
        await tx.canonFact.updateMany({
          where: { id: { in: linkedFactIds } },
          data: { isDirty: true },
        });
      }
    });

    return {
      message: `Restored to version ${version.versionNumber}`,
      newVersionNumber: nextVersion,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BULK IMPORT (.md / .txt)
  // ─────────────────────────────────────────────────────────────────────────

  async importFromFile(
    novelId: string,
    userId: string,
    file: Express.Multer.File,
    dto: ImportChaptersDto,
  ) {
    await this.novelsService.assertOwner(novelId, userId);

    const ext = file.originalname.split('.').pop()?.toLowerCase();

    let segments: ChapterSegment[];
    
    if (ext === 'pdf') {
      // Parse PDF
      segments = await parsePdfToChapters(file.buffer);
    } else {
      // Parse text-based files
      const text = file.buffer.toString('utf-8');
      
      if (ext === 'md') {
        segments = parseMarkdownToChapters(text);
      } else if (ext === 'txt') {
        segments = parseTxtToChapters(text);
      } else {
        throw new BadRequestException(
          `Unsupported file type ".${ext}". Only .md, .txt, and .pdf are accepted.`,
        );
      }
    }

    if (segments.length === 0) {
      throw new BadRequestException('No chapter content found in the uploaded file.');
    }

    // Determine starting number
    const last = await this.prisma.chapter.findFirst({
      where: { novelId },
      orderBy: { chapterNumber: 'desc' },
      select: { chapterNumber: true },
    });
    let nextNum = dto.startChapterNumber ?? (last?.chapterNumber ?? 0) + 1;

    const created: { id: string; chapterNumber: number; title?: string }[] = [];

    for (const seg of segments) {
      const wordCount = countWords(seg.content);

      await this.prisma.$transaction(async (tx) => {
        const chapter = await tx.chapter.create({
          data: {
            novelId,
            chapterNumber: nextNum,
            title: seg.title,
            content: seg.content,
            wordCount,
            status: ChapterStatus.completed_locked,
            source: ChapterSource.manual,
          },
        });

        await tx.chapterVersion.create({
          data: {
            chapterId: chapter.id,
            versionNumber: 1,
            content: seg.content,
            wordCount,
            changeSummary: 'Imported from file',
            createdById: userId,
            source: VersionSource.manual_edit,
          },
        });

        await tx.novel.update({
          where: { id: novelId },
          data: { chapterCount: { increment: 1 } },
        });

        created.push({ id: chapter.id, chapterNumber: nextNum, title: seg.title });
      });

      nextNum++;
    }

    return {
      imported: created.length,
      chapters: created,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers (used by ReaderModule via export)
  // ─────────────────────────────────────────────────────────────────────────

  /** Used by ReaderService to fetch readable chapters without crossing DB boundary. */
  async findReadable(
    novelId: string,
    opts?: { select?: Record<string, boolean> },
  ) {
    return this.prisma.chapter.findMany({
      where: {
        novelId,
        status: {
          in: [ChapterStatus.completed_locked, ChapterStatus.completed_editable],
        },
      },
      orderBy: { chapterNumber: 'asc' },
      select: opts?.select ?? {
        id: true,
        chapterNumber: true,
        title: true,
        wordCount: true,
        status: true,
        summary: true,
      },
    });
  }

  async findReadableOne(chapterId: string) {
    return this.prisma.chapter.findFirst({
      where: {
        id: chapterId,
        status: {
          in: [ChapterStatus.completed_locked, ChapterStatus.completed_editable],
        },
      },
    });
  }

  async findAdjacentChapters(novelId: string, chapterNumber: number) {
    const [prev, next] = await Promise.all([
      this.prisma.chapter.findFirst({
        where: {
          novelId,
          chapterNumber: { lt: chapterNumber },
          status: {
            in: [ChapterStatus.completed_locked, ChapterStatus.completed_editable],
          },
        },
        orderBy: { chapterNumber: 'desc' },
        select: { id: true, chapterNumber: true, title: true },
      }),
      this.prisma.chapter.findFirst({
        where: {
          novelId,
          chapterNumber: { gt: chapterNumber },
          status: {
            in: [ChapterStatus.completed_locked, ChapterStatus.completed_editable],
          },
        },
        orderBy: { chapterNumber: 'asc' },
        select: { id: true, chapterNumber: true, title: true },
      }),
    ]);
    return { prev, next };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private utils
  // ─────────────────────────────────────────────────────────────────────────

  private async resolveChapterNumber(
    novelId: string,
    requested?: number,
  ): Promise<number> {
    if (requested !== undefined) {
      const conflict = await this.prisma.chapter.findUnique({
        where: { novelId_chapterNumber: { novelId, chapterNumber: requested } },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException(
          `Chapter number ${requested} already exists in this novel.`,
        );
      }
      return requested;
    }

    const last = await this.prisma.chapter.findFirst({
      where: { novelId },
      orderBy: { chapterNumber: 'desc' },
      select: { chapterNumber: true },
    });
    return (last?.chapterNumber ?? 0) + 1;
  }

  private async getNextVersionNumber(chapterId: string): Promise<number> {
    const last = await this.prisma.chapterVersion.findFirst({
      where: { chapterId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return (last?.versionNumber ?? 0) + 1;
  }
}
