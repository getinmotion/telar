import { DataSource } from 'typeorm';
import { ArtisanIdentity } from './entities/artisan-identity.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

export const artisanIdentityProviders = [
  {
    provide: 'ARTISAN_IDENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanIdentity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_PROFILES_REPOSITORY_FOR_IDENTITY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProfile),
    inject: ['DATA_SOURCE'],
  },
];
