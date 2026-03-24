import { DataSource } from 'typeorm';
import {
  Store,
  StoreArtisanalProfile,
  StoreContacts,
  StoreAward,
  StoreBadge,
  ArtisanShop,
} from './entities';

export const storesProviders = [
  {
    provide: 'STORES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Store),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STORE_ARTISANAL_PROFILES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StoreArtisanalProfile),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STORE_CONTACTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StoreContacts),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STORE_AWARDS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StoreAward),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STORE_BADGES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StoreBadge),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_SHOPS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
];
