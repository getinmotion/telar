import { DataSource } from 'typeorm';
import { FeaturedCollection } from './entities/featured-collection.entity';

export const featuredCollectionsProviders = [
  {
    provide: 'FEATURED_COLLECTIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(FeaturedCollection),
    inject: ['DATA_SOURCE'],
  },
];
