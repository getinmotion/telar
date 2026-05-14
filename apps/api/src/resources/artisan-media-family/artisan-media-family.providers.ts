import { DataSource } from 'typeorm';
import { ArtisanMediaFamily } from './entities/artisan-media-family.entity';

export const artisanMediaFamilyProviders = [
  {
    provide: 'ARTISAN_MEDIA_FAMILY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanMediaFamily),
    inject: ['DATA_SOURCE'],
  },
];
