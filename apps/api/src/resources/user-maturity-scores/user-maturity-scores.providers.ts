import { DataSource } from 'typeorm';
import { UserMaturityScore } from './entities/user-maturity-score.entity';

export const userMaturityScoresProviders = [
  {
    provide: 'USER_MATURITY_SCORES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserMaturityScore),
    inject: ['DATA_SOURCE'],
  },
];
