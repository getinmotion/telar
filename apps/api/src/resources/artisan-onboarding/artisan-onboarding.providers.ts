import { DataSource } from 'typeorm';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { ArtisanOrigin } from '../artisan-origin/entities/artisan-origin.entity';
import { ArtisanIdentity } from '../artisan-identity/entities/artisan-identity.entity';
import { UserMasterContext } from '../user-master-context/entities/user-master-context.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { Category } from '../categories/entities/category.entity';

export const artisanOnboardingProviders = [
  {
    provide: 'ARTISAN_PROFILE_REPOSITORY',
    useFactory: (ds: DataSource) => ds.getRepository(UserProfile),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_ORIGIN_REPOSITORY',
    useFactory: (ds: DataSource) => ds.getRepository(ArtisanOrigin),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_IDENTITY_REPOSITORY',
    useFactory: (ds: DataSource) => ds.getRepository(ArtisanIdentity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_MASTER_CONTEXT_REPOSITORY',
    useFactory: (ds: DataSource) => ds.getRepository(UserMasterContext),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_SHOP_REPOSITORY',
    useFactory: (ds: DataSource) => ds.getRepository(ArtisanShop),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'TAXONOMY_CATEGORIES_REPOSITORY',
    useFactory: (ds: DataSource) => ds.getRepository(Category),
    inject: ['DATA_SOURCE'],
  },
];
