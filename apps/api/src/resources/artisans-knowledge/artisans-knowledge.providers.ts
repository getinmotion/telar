import { DataSource } from 'typeorm';
import { ArtisansIdentityOne } from './entities/artisans-identity-one.entity';
import { ArtisansCommercialTwo } from './entities/artisans-commercial-two.entity';
import { ArtisansClientMarketThree } from './entities/artisans-client-market-three.entity';
import { ArtisansOperationGrowthFour } from './entities/artisans-operation-growth-four.entity';
import { ArtisansIdentityProfile } from './entities/artisans-identity-profile.entity';

export const artisansKnowledgeProviders = [
  {
    provide: 'ARTISANS_IDENTITY_ONE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisansIdentityOne),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISANS_COMMERCIAL_TWO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisansCommercialTwo),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISANS_CLIENT_MARKET_THREE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisansClientMarketThree),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISANS_OPERATION_GROWTH_FOUR_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisansOperationGrowthFour),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISANS_IDENTITY_PROFILE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisansIdentityProfile),
    inject: ['DATA_SOURCE'],
  },
];
