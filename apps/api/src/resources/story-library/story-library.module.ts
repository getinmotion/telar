import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { StoryLibraryService } from './story-library.service';
import { StoryLibraryController } from './story-library.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { storyLibraryProviders } from './story-library.providers';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('PASSWORD_SECRET'),
        signOptions: { expiresIn: '4h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StoryLibraryController],
  providers: [...storyLibraryProviders, StoryLibraryService],
  exports: [StoryLibraryService, ...storyLibraryProviders],
})
export class StoryLibraryModule {}
