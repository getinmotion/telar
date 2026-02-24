import { DataSource } from 'typeorm';
import { Address } from './entities/address.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

export const addressesProviders = [
  {
    provide: 'ADDRESSES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Address),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_PROFILES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProfile),
    inject: ['DATA_SOURCE'],
  },
];
