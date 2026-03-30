import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { badgesProviders } from './badges.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BadgesController],
  providers: [...badgesProviders, BadgesService],
  exports: [BadgesService, ...badgesProviders],
})
export class BadgesModule {}
