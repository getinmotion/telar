import { Module } from '@nestjs/common';
import { CuratorialCategoriesService } from './curatorial-categories.service';
import { CuratorialCategoriesController } from './curatorial-categories.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { curatorialCategoriesProviders } from './curatorial-categories.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CuratorialCategoriesController],
  providers: [...curatorialCategoriesProviders, CuratorialCategoriesService],
  exports: [CuratorialCategoriesService, ...curatorialCategoriesProviders],
})
export class CuratorialCategoriesModule {}
