import { Module, forwardRef } from '@nestjs/common';
import { ModerationQueueService } from './moderation-queue.service';
import { ModerationQueueController } from './moderation-queue.controller';
import { moderationQueueProviders } from './moderation-queue.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [ModerationQueueController],
  providers: [...moderationQueueProviders, ModerationQueueService],
  exports: [ModerationQueueService],
})
export class ModerationQueueModule {}
