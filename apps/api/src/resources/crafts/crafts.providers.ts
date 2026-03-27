import { DataSource } from 'typeorm';
import { Craft } from './entities/craft.entity';

export const craftsProviders = [
  {
    provide: 'CRAFTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Craft),
    inject: ['DATA_SOURCE'],
  },
];
