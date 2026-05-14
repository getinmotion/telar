import { Module } from '@nestjs/common';
import { ArtisanMaterialsService } from './artisan-materials.service';
import { ArtisanMaterialsController } from './artisan-materials.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanMaterialsProviders } from './artisan-materials.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanMaterialsController],
  providers: [...artisanMaterialsProviders, ArtisanMaterialsService],
  exports: [ArtisanMaterialsService],
})
export class ArtisanMaterialsModule {}
