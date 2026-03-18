import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { productVariantsProviders } from './product-variants.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductVariantsController],
  providers: [...productVariantsProviders, ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
