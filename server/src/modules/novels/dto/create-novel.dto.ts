import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNovelDto {
  @ApiProperty({ example: 'Hành Trình Vạn Dặm' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Tiên hiệp' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({ default: 'vi', example: 'vi' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @ApiPropertyOptional({ description: 'Phong cách, giọng văn' })
  @IsOptional()
  @IsString()
  writingStyle?: string;

  @ApiPropertyOptional({ description: 'Chỉ dẫn sáng tác chung' })
  @IsOptional()
  @IsString()
  writingNotes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
