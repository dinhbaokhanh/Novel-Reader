import { Module } from '@nestjs/common';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';

@Module({
  providers: [NovelsService],
  controllers: [NovelsController],
  exports: [NovelsService], // Exported so ChaptersModule can call assertOwner()
})
export class NovelsModule {}
