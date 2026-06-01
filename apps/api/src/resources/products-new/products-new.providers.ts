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
import { Category } from '../categories/entities/category.entity';
import { Technique } from '../techniques/entities/technique.entity';
import { Territory } from '../territories/entities/territory.entity';
import { ArtisanShop } from '../stores/entities/artisan-shop.entity';

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
  {
    provide: 'SKU_CATEGORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Category),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SKU_TECHNIQUE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Technique),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SKU_TERRITORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Territory),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SKU_ARTISAN_SHOP_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
];
