import { DataSource } from 'typeorm';
import { ArtisanMediaCommunity } from './entities/artisan-media-community.entity';

export const artisanMediaCommunityProviders = [
  {
    provide: 'ARTISAN_MEDIA_COMMUNITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanMediaCommunity),
    inject: ['DATA_SOURCE'],
  },
];
