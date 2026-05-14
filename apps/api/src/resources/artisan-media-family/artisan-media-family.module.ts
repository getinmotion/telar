import { Module } from '@nestjs/common';
import { ArtisanMediaFamilyService } from './artisan-media-family.service';
import { ArtisanMediaFamilyController } from './artisan-media-family.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanMediaFamilyProviders } from './artisan-media-family.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanMediaFamilyController],
  providers: [...artisanMediaFamilyProviders, ArtisanMediaFamilyService],
  exports: [ArtisanMediaFamilyService],
})
export class ArtisanMediaFamilyModule {}
