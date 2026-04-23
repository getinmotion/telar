import { DataSource } from 'typeorm';
import { ArtisanIdentity } from './entities/artisan-identity.entity';

export const artisanIdentityProviders = [
  {
    provide: 'ARTISAN_IDENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanIdentity),
    inject: ['DATA_SOURCE'],
  },
];
