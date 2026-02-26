import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { notificationsProviders } from './notifications.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [...notificationsProviders, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
