import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { NovelsService } from './novels.service';

@ApiTags('Novels')
@ApiBearerAuth()
@Controller('novels')
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new novel' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateNovelDto) {
    return this.novelsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my novels' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.novelsService.findAllByOwner(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get novel detail' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.novelsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update novel metadata' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateNovelDto,
  ) {
    return this.novelsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive (soft-delete) novel' })
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.novelsService.archive(id, user.id);
  }
}
