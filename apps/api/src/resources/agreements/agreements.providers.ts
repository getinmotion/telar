import { DataSource } from 'typeorm';
import { Agreement } from './entities/agreement.entity';

export const agreementsProviders = [
  {
    provide: 'AGREEMENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Agreement),
    inject: ['DATA_SOURCE'],
  },
];
