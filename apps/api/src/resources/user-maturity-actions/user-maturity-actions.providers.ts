import { DataSource } from 'typeorm';
import { UserMaturityAction } from './entities/user-maturity-action.entity';

export const userMaturityActionsProviders = [
  {
    provide: 'USER_MATURITY_ACTIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserMaturityAction),
    inject: ['DATA_SOURCE'],
  },
];

