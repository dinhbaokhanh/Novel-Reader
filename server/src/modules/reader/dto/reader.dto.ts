import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveProgressDto {
  @ApiProperty()
  @IsUUID()
  novelId: string;

  @ApiProperty()
  @IsUUID()
  chapterId: string;

  @ApiPropertyOptional({ description: 'Scroll offset in pixels or percentage (0–100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  scrollPosition?: number;
}

export class CreateBookmarkDto {
  @ApiProperty()
  @IsUUID()
  novelId: string;

  @ApiProperty()
  @IsUUID()
  chapterId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  scrollPosition?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
