import { Module } from '@nestjs/common';
import { ArtisanMediaWorkshopService } from './artisan-media-workshop.service';
import { ArtisanMediaWorkshopController } from './artisan-media-workshop.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanMediaWorkshopProviders } from './artisan-media-workshop.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanMediaWorkshopController],
  providers: [...artisanMediaWorkshopProviders, ArtisanMediaWorkshopService],
  exports: [ArtisanMediaWorkshopService],
})
export class ArtisanMediaWorkshopModule {}
