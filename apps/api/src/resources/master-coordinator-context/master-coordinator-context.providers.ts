import { DataSource } from 'typeorm';
import { MasterCoordinatorContext } from './entities/master-coordinator-context.entity';

export const masterCoordinatorContextProviders = [
  {
    provide: 'MASTER_COORDINATOR_CONTEXT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(MasterCoordinatorContext),
    inject: ['DATA_SOURCE'],
  },
];
