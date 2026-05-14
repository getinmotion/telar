import { DataSource } from 'typeorm';
import { ArtisanMediaWorking } from './entities/artisan-media-working.entity';

export const artisanMediaWorkingProviders = [
  {
    provide: 'ARTISAN_MEDIA_WORKING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanMediaWorking),
    inject: ['DATA_SOURCE'],
  },
];
