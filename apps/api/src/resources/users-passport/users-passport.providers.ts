import { DataSource } from 'typeorm';
import { UsersPassport } from './entities/users-passport.entity';

export const usersPassportProviders = [
  {
    provide: 'USERS_PASSPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UsersPassport),
    inject: ['DATA_SOURCE'],
  },
];
