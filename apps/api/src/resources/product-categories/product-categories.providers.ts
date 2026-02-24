import { DataSource } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';

export const productCategoriesProviders = [
  {
    provide: 'PRODUCT_CATEGORIES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductCategory),
    inject: ['DATA_SOURCE'],
  },
];

