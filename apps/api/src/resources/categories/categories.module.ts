import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { categoriesProviders } from './categories.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [...categoriesProviders, CategoriesService],
  exports: [CategoriesService, ...categoriesProviders],
})
export class CategoriesModule {}
