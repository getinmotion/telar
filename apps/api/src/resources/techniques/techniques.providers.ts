import { DataSource } from 'typeorm';
import { Technique } from './entities/technique.entity';

export const techniquesProviders = [
  {
    provide: 'TECHNIQUES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Technique),
    inject: ['DATA_SOURCE'],
  },
];
