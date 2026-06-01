import { DataSource } from 'typeorm';
import { ArtisanMaterial } from './entities/artisan-material.entity';

export const artisanMaterialsProviders = [
  {
    provide: 'ARTISAN_MATERIALS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanMaterial),
    inject: ['DATA_SOURCE'],
  },
];
