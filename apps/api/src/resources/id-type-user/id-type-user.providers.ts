import { DataSource } from 'typeorm';
import { IdTypeUser } from './entities/id-type-user.entity';

export const idTypeUserProviders = [
  {
    provide: 'ID_TYPE_USER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IdTypeUser),
    inject: ['DATA_SOURCE'],
  },
];
