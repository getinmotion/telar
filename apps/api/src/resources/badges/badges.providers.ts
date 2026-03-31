import { DataSource } from 'typeorm';
import { Badge } from './entities/badge.entity';

export const badgesProviders = [
  {
    provide: 'BADGES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Badge),
    inject: ['DATA_SOURCE'],
  },
];
