import { Module } from '@nestjs/common';
import { ArtisanMediaWorkingService } from './artisan-media-working.service';
import { ArtisanMediaWorkingController } from './artisan-media-working.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanMediaWorkingProviders } from './artisan-media-working.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanMediaWorkingController],
  providers: [...artisanMediaWorkingProviders, ArtisanMediaWorkingService],
  exports: [ArtisanMediaWorkingService],
})
export class ArtisanMediaWorkingModule {}
