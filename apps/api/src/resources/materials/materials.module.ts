import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { materialsProviders } from './materials.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [MaterialsController],
  providers: [...materialsProviders, MaterialsService],
  exports: [MaterialsService, ...materialsProviders],
})
export class MaterialsModule {}
