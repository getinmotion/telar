import { Module } from '@nestjs/common';
import { ArtisanTerritorialService } from './artisan-territorial.service';
import { ArtisanTerritorialController } from './artisan-territorial.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanTerritorialProviders } from './artisan-territorial.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanTerritorialController],
  providers: [...artisanTerritorialProviders, ArtisanTerritorialService],
  exports: [ArtisanTerritorialService],
})
export class ArtisanTerritorialModule {}
