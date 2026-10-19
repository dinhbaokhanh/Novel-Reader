import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChapterContentDto {
  @ApiProperty({ description: 'Updated chapter content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'Sửa đoạn mở đầu' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;
}
