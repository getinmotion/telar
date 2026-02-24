import { DataSource } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';

export const userProfilesProviders = [
  {
    provide: 'USER_PROFILES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProfile),
    inject: ['DATA_SOURCE'],
  },
];

