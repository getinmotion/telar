import { DataSource } from 'typeorm';
import { ProductIdentity } from './entities/product-identity.entity';

export const productIdentityProviders = [
  {
    provide: 'PRODUCT_IDENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductIdentity),
    inject: ['DATA_SOURCE'],
  },
];
