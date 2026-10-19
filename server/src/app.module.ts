import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateConfig } from './config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NovelsModule } from './modules/novels/novels.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { ReaderModule } from './modules/reader/reader.module';

@Module({
  imports: [
    // Config loaded first, globally available
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),

    // Infrastructure (global — PrismaService available everywhere)
    DatabaseModule,

    // Domain modules
    AuthModule,
    UsersModule,
    NovelsModule,
    ChaptersModule,
    ReaderModule,
  ],
})
export class AppModule {}
