import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProductsNewService } from './products-new.service';
import { ProductsNewAnalyticsService } from './products-new-analytics.service';
import { SkuGeneratorService } from './sku-generator.service';
import { ProductsNewController } from './products-new.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { productsNewProviders } from './products-new.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    ConfigModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ProductsNewController],
  providers: [...productsNewProviders, ProductsNewService, ProductsNewAnalyticsService, SkuGeneratorService],
  exports: [ProductsNewService, ProductsNewAnalyticsService, SkuGeneratorService, ...productsNewProviders],
})
export class ProductsNewModule {}
