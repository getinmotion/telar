import { DataSource } from 'typeorm';
import { UserMasterContext } from './entities/user-master-context.entity';

export const userMasterContextProviders = [
  {
    provide: 'USER_MASTER_CONTEXT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserMasterContext),
    inject: ['DATA_SOURCE'],
  },
];

