import { DataSource } from 'typeorm';
import {
  ProductCore,
  ProductArtisanalIdentity,
  ProductPhysicalSpecs,
  ProductLogistics,
  ProductProduction,
  ProductMedia,
  ProductBadge,
  ProductMaterialLink,
  ProductVariant,
} from './entities';

export const productsNewProviders = [
  {
    provide: 'PRODUCTS_CORE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductCore),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_ARTISANAL_IDENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductArtisanalIdentity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_PHYSICAL_SPECS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductPhysicalSpecs),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_LOGISTICS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductLogistics),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_PRODUCTION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductProduction),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_MEDIA_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductMedia),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_BADGES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductBadge),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_MATERIALS_LINK_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductMaterialLink),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_VARIANTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductVariant),
    inject: ['DATA_SOURCE'],
  },
];
