import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { ImportChaptersDto } from './dto/import-chapters.dto';
import { UpdateChapterContentDto } from './dto/update-chapter-content.dto';

@ApiTags('Chapters')
@ApiBearerAuth()
@Controller()
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  // ── Novel-scoped ──────────────────────────────────────────────────────

  @Post('novels/:novelId/chapters')
  @ApiOperation({ summary: 'Create a chapter manually' })
  create(
    @Param('novelId', ParseUUIDPipe) novelId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateChapterDto,
  ) {
    return this.chaptersService.create(novelId, user.id, dto);
  }

  @Get('novels/:novelId/chapters')
  @ApiOperation({ summary: 'List all chapters of a novel' })
  findAll(
    @Param('novelId', ParseUUIDPipe) novelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.findAll(novelId, user.id);
  }

  @Post('novels/:novelId/chapters/import')
  @ApiOperation({ summary: 'Bulk import chapters from a .md, .txt, or .pdf file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        startChapterNumber: { type: 'integer', example: 1 },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        if (ext === 'md' || ext === 'txt' || ext === 'pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only .md, .txt, and .pdf files are allowed'), false);
        }
      },
    }),
  )
  importFile(
    @Param('novelId', ParseUUIDPipe) novelId: string,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportChaptersDto,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.chaptersService.importFromFile(novelId, user.id, file, dto);
  }

  // ── Chapter-scoped ────────────────────────────────────────────────────

  @Get('chapters/:id')
  @ApiOperation({ summary: 'Get chapter with full content' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.findOne(id, user.id);
  }

  @Put('chapters/:id/content')
  @ApiOperation({ summary: 'Update chapter content (must be unlocked)' })
  updateContent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateChapterContentDto,
  ) {
    return this.chaptersService.updateContent(id, user.id, dto);
  }

  @Delete('chapters/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a chapter (must be unlocked)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.remove(id, user.id);
  }

  @Patch('chapters/:id/lock')
  @ApiOperation({ summary: 'Lock chapter (completed_editable → completed_locked)' })
  lock(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.lock(id, user.id);
  }

  @Patch('chapters/:id/unlock')
  @ApiOperation({ summary: 'Unlock chapter for editing (completed_locked → completed_editable)' })
  unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.unlock(id, user.id);
  }

  // ── Versions ──────────────────────────────────────────────────────────

  @Get('chapters/:id/versions')
  @ApiOperation({ summary: 'List version history (newest first)' })
  getVersions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.getVersions(id, user.id);
  }

  @Get('chapters/:id/versions/:versionId')
  @ApiOperation({ summary: 'Get full content of a specific version' })
  getVersionContent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.getVersionContent(id, versionId, user.id);
  }

  @Post('chapters/:id/versions/:versionId/restore')
  @ApiOperation({ summary: 'Restore a previous version (chapter must be unlocked)' })
  restoreVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.restoreVersion(id, versionId, user.id);
  }
}
