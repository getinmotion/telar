import { DataSource } from 'typeorm';
import { StoreHealthScore } from './entities/store-health-score.entity';

export const storeHealthScoresProviders = [
  {
    provide: 'STORE_HEALTH_SCORES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StoreHealthScore),
    inject: ['DATA_SOURCE'],
  },
];
