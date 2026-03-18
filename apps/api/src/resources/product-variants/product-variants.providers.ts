import { DataSource } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';

export const productVariantsProviders = [
  {
    provide: 'PRODUCT_VARIANTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductVariant),
    inject: ['DATA_SOURCE'],
  },
];
