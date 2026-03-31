import { Module } from '@nestjs/common';
import { ProductsNewService } from './products-new.service';
import { ProductsNewController } from './products-new.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { productsNewProviders } from './products-new.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsNewController],
  providers: [...productsNewProviders, ProductsNewService],
  exports: [ProductsNewService, ...productsNewProviders],
})
export class ProductsNewModule {}
