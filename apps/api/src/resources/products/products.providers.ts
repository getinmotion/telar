import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import {
  ProductCore,
  ProductArtisanalIdentity,
  ProductMaterialLink,
  ProductPhysicalSpecs,
  ProductProduction,
  ProductMedia,
  ProductVariantV2,
} from './entities/v2/product-core.entity';

export const productsProviders = [
  {
    provide: 'PRODUCTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Product),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_CORE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductCore),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_ARTISANAL_IDENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductArtisanalIdentity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_MATERIAL_LINK_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductMaterialLink),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_PHYSICAL_SPECS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductPhysicalSpecs),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_PRODUCTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductProduction),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_MEDIA_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductMedia),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_VARIANT_V2_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductVariantV2),
    inject: ['DATA_SOURCE'],
  },
];
