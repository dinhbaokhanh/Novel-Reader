import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImportChaptersDto {
  @ApiPropertyOptional({
    description:
      'Starting chapter number for the imported batch. Defaults to (current max + 1).',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  startChapterNumber?: number;
}
