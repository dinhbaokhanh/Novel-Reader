import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateNovelDto } from './create-novel.dto';

const NOVEL_STATUSES = ['draft', 'active', 'completed', 'archived'] as const;

export class UpdateNovelDto extends PartialType(CreateNovelDto) {
  @ApiPropertyOptional({ enum: NOVEL_STATUSES })
  @IsOptional()
  @IsIn(NOVEL_STATUSES)
  status?: string;
}
