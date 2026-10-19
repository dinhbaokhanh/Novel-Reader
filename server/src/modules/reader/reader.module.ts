import { Module } from '@nestjs/common';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { ChaptersModule } from '../chapters/chapters.module';
import { NovelsModule } from '../novels/novels.module';

@Module({
  imports: [
    NovelsModule,   // for NovelsService.assertOwner()
    ChaptersModule, // for ChaptersService.findReadable(), findReadableOne(), findAdjacentChapters()
  ],
  providers: [ReaderService],
  controllers: [ReaderController],
})
export class ReaderModule {}
