import { DataSource } from 'typeorm';
import { UsersIdAgreement } from './entities/users-id-agreement.entity';

export const usersIdAgreementProviders = [
  {
    provide: 'USERS_ID_AGREEMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UsersIdAgreement),
    inject: ['DATA_SOURCE'],
  },
];
