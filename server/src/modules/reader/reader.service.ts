import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ChaptersService } from '../chapters/chapters.service';
import { NovelsService } from '../novels/novels.service';
import { CreateBookmarkDto, SaveProgressDto } from './dto/reader.dto';

@Injectable()
export class ReaderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly novelsService: NovelsService,
    private readonly chaptersService: ChaptersService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // TABLE OF CONTENTS
  // ─────────────────────────────────────────────────────────────────────────

  async getTableOfContents(novelId: string, userId: string) {
    // Ownership check via NovelsService — reader doesn't query novels table directly
    await this.novelsService.assertOwner(novelId, userId);

    // Content via ChaptersService — reader doesn't query chapters table directly
    return this.chaptersService.findReadable(novelId, {
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        wordCount: true,
        status: true,
        summary: true,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTINUE READING
  // ─────────────────────────────────────────────────────────────────────────

  async getContinuePosition(novelId: string, userId: string) {
    await this.novelsService.assertOwner(novelId, userId);

    const progress = await this.prisma.readingProgress.findUnique({
      where: { userId_novelId: { userId, novelId } },
      select: { lastChapterId: true, lastScrollPosition: true },
    });

    if (progress) {
      return {
        chapterId: progress.lastChapterId,
        scrollPosition: progress.lastScrollPosition ?? 0,
      };
    }

    // No progress yet → return first readable chapter
    const chapters = await this.chaptersService.findReadable(novelId, {
      select: { id: true, chapterNumber: true },
    });
    const first = (chapters as any[])[0];

    return {
      chapterId: first?.id ?? null,
      scrollPosition: 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // READ A CHAPTER
  // ─────────────────────────────────────────────────────────────────────────

  async readChapter(chapterId: string, userId: string) {
    // Get readable chapter through ChaptersService (module boundary respected)
    const chapter = await this.chaptersService.findReadableOne(chapterId);

    if (!chapter) throw new NotFoundException('Chapter not found or not readable');

    // Verify ownership of the novel
    await this.novelsService.assertOwner(chapter.novelId, userId);

    // Get prev/next navigation
    const { prev, next } = await this.chaptersService.findAdjacentChapters(
      chapter.novelId,
      chapter.chapterNumber,
    );

    return { chapter, prev, next };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // READING PROGRESS
  // ─────────────────────────────────────────────────────────────────────────

  async saveProgress(userId: string, dto: SaveProgressDto) {
    await this.novelsService.assertOwner(dto.novelId, userId);

    return this.prisma.readingProgress.upsert({
      where: { userId_novelId: { userId, novelId: dto.novelId } },
      create: {
        userId,
        novelId: dto.novelId,
        lastChapterId: dto.chapterId,
        lastScrollPosition: dto.scrollPosition,
      },
      update: {
        lastChapterId: dto.chapterId,
        lastScrollPosition: dto.scrollPosition,
      },
    });
  }

  async getProgress(userId: string, novelId: string) {
    await this.novelsService.assertOwner(novelId, userId);

    return this.prisma.readingProgress.findUnique({
      where: { userId_novelId: { userId, novelId } },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BOOKMARKS
  // ─────────────────────────────────────────────────────────────────────────

  async getBookmarks(userId: string, novelId?: string) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
        ...(novelId ? { novelId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        chapter: { select: { chapterNumber: true, title: true } },
        novel: { select: { title: true } },
      },
    });
  }

  async createBookmark(userId: string, dto: CreateBookmarkDto) {
    await this.novelsService.assertOwner(dto.novelId, userId);

    return this.prisma.bookmark.create({
      data: {
        userId,
        novelId: dto.novelId,
        chapterId: dto.chapterId,
        scrollPosition: dto.scrollPosition,
        note: dto.note,
      },
    });
  }

  async deleteBookmark(bookmarkId: string, userId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });
    if (!bookmark) throw new NotFoundException('Bookmark not found');

    await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
    return { deleted: true };
  }
}
