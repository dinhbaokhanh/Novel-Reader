import { Module } from '@nestjs/common';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { NovelsModule } from '../novels/novels.module';

@Module({
  imports: [NovelsModule], // for NovelsService.assertOwner()
  providers: [ChaptersService],
  controllers: [ChaptersController],
  exports: [ChaptersService], // exported so ReaderModule can call findReadable()
})
export class ChaptersModule {}
