import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AchievementsCatalogService } from './achievements-catalog.service';
import { AchievementsCatalogController } from './achievements-catalog.controller';
import { achievementsCatalogProviders } from './achievements-catalog.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AchievementsCatalogController],
  providers: [AchievementsCatalogService, ...achievementsCatalogProviders],
  exports: [AchievementsCatalogService, ...achievementsCatalogProviders],
})
export class AchievementsCatalogModule {}
