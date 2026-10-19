import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiPropertyOptional({
    description: 'Chapter number. Omit to auto-assign (max + 1).',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  chapterNumber?: number;

  @ApiPropertyOptional({ example: 'Khởi Đầu' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ description: 'Full chapter content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Short summary of this chapter' })
  @IsOptional()
  @IsString()
  summary?: string;
}
