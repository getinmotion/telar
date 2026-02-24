import { DataSource } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';

export const userProgressProviders = [
  {
    provide: 'USER_PROGRESS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProgress),
    inject: ['DATA_SOURCE'],
  },
];
