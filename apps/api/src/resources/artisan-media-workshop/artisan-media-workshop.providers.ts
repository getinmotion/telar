import { DataSource } from 'typeorm';
import { ArtisanMediaWorkshop } from './entities/artisan-media-workshop.entity';

export const artisanMediaWorkshopProviders = [
  {
    provide: 'ARTISAN_MEDIA_WORKSHOP_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanMediaWorkshop),
    inject: ['DATA_SOURCE'],
  },
];
