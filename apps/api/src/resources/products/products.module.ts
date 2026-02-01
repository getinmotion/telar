import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { productsProviders } from './products.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [ProductsController],
  providers: [...productsProviders, ProductsService],
  exports: [ProductsService, ...productsProviders],
})
export class ProductsModule {}
