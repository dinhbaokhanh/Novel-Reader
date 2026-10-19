import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NovelStatus } from '@prisma/client';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';

/** Fields safe to return in list/detail responses */
const NOVEL_SELECT = {
  id: true,
  title: true,
  description: true,
  genre: true,
  language: true,
  writingStyle: true,
  writingNotes: true,
  status: true,
  isPrivate: true,
  chapterCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class NovelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateNovelDto) {
    return this.prisma.novel.create({
      data: {
        ownerId,
        title: dto.title,
        description: dto.description,
        genre: dto.genre,
        language: dto.language ?? 'vi',
        writingStyle: dto.writingStyle,
        writingNotes: dto.writingNotes,
        isPrivate: dto.isPrivate ?? true,
        status: NovelStatus.draft,
      },
      select: NOVEL_SELECT,
    });
  }

  async findAllByOwner(ownerId: string) {
    return this.prisma.novel.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      select: NOVEL_SELECT,
    });
  }

  async findOne(id: string, ownerId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
      select: { ...NOVEL_SELECT, ownerId: true },
    });
    if (!novel) throw new NotFoundException('Novel not found');
    if (novel.ownerId !== ownerId) throw new ForbiddenException();
    return novel;
  }

  async update(id: string, ownerId: string, dto: UpdateNovelDto) {
    await this.assertOwner(id, ownerId);
    return this.prisma.novel.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.genre !== undefined && { genre: dto.genre }),
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.writingStyle !== undefined && { writingStyle: dto.writingStyle }),
        ...(dto.writingNotes !== undefined && { writingNotes: dto.writingNotes }),
        ...(dto.isPrivate !== undefined && { isPrivate: dto.isPrivate }),
        ...(dto.status !== undefined && { status: dto.status as NovelStatus }),
      },
      select: NOVEL_SELECT,
    });
  }

  /** Soft-delete: archive instead of hard-delete */
  async archive(id: string, ownerId: string) {
    await this.assertOwner(id, ownerId);
    return this.prisma.novel.update({
      where: { id },
      data: { status: NovelStatus.archived },
      select: { id: true, status: true },
    });
  }

  /**
   * Asserts the user owns the novel.
   * Exported for use by other modules (chapters, reader).
   * Returns the novel so callers can reuse it without a second query.
   */
  async assertOwner(novelId: string, ownerId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      select: { id: true, ownerId: true, status: true, chapterCount: true },
    });
    if (!novel) throw new NotFoundException('Novel not found');
    if (novel.ownerId !== ownerId) throw new ForbiddenException('Access denied');
    return novel;
  }
}
