import { Module, forwardRef } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { productCategoriesProviders } from './product-categories.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [ProductCategoriesController],
  providers: [...productCategoriesProviders, ProductCategoriesService],
  exports: [ProductCategoriesService, ...productCategoriesProviders],
})
export class ProductCategoriesModule {}
