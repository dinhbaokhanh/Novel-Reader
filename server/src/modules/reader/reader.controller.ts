import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBookmarkDto, SaveProgressDto } from './dto/reader.dto';
import { ReaderService } from './reader.service';

@ApiTags('Reader')
@ApiBearerAuth()
@Controller()
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  // ── Table of contents & continue ─────────────────────────────────────

  @Get('novels/:novelId/reader/toc')
  @ApiOperation({ summary: 'Get table of contents for a novel' })
  getToc(
    @Param('novelId', ParseUUIDPipe) novelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.readerService.getTableOfContents(novelId, user.id);
  }

  @Get('novels/:novelId/reader/continue')
  @ApiOperation({ summary: 'Get last reading position (chapter + scroll)' })
  getContinue(
    @Param('novelId', ParseUUIDPipe) novelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.readerService.getContinuePosition(novelId, user.id);
  }

  // ── Read chapter ──────────────────────────────────────────────────────

  @Get('reader/chapters/:chapterId')
  @ApiOperation({ summary: 'Read a chapter (includes prev/next navigation)' })
  readChapter(
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.readerService.readChapter(chapterId, user.id);
  }

  // ── Progress ──────────────────────────────────────────────────────────

  @Post('reader/progress')
  @ApiOperation({ summary: 'Save reading progress' })
  saveProgress(@CurrentUser() user: AuthUser, @Body() dto: SaveProgressDto) {
    return this.readerService.saveProgress(user.id, dto);
  }

  @Get('novels/:novelId/reader/progress')
  @ApiOperation({ summary: 'Get reading progress for a novel' })
  getProgress(
    @Param('novelId', ParseUUIDPipe) novelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.readerService.getProgress(user.id, novelId);
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────

  @Get('reader/bookmarks')
  @ApiOperation({ summary: 'Get all bookmarks (optionally filtered by novel)' })
  @ApiQuery({ name: 'novelId', required: false, type: String })
  getBookmarks(
    @CurrentUser() user: AuthUser,
    @Query('novelId') novelId?: string,
  ) {
    return this.readerService.getBookmarks(user.id, novelId);
  }

  @Post('reader/bookmarks')
  @ApiOperation({ summary: 'Create a bookmark' })
  createBookmark(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.readerService.createBookmark(user.id, dto);
  }

  @Delete('reader/bookmarks/:id')
  @ApiOperation({ summary: 'Delete a bookmark' })
  deleteBookmark(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.readerService.deleteBookmark(id, user.id);
  }
}
