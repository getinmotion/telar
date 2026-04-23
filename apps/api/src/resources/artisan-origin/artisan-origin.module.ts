import { Module } from '@nestjs/common';
import { ArtisanOriginService } from './artisan-origin.service';
import { ArtisanOriginController } from './artisan-origin.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanOriginProviders } from './artisan-origin.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanOriginController],
  providers: [...artisanOriginProviders, ArtisanOriginService],
  exports: [ArtisanOriginService],
})
export class ArtisanOriginModule {}
