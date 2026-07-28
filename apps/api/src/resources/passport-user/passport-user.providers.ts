import { DataSource } from 'typeorm';
import { PassportUser } from './entities/passport-user.entity';

export const passportUserProviders = [
  {
    provide: 'PASSPORT_USER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PassportUser),
    inject: ['DATA_SOURCE'],
  },
];
