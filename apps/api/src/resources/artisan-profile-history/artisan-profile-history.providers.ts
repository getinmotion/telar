import { DataSource } from 'typeorm';
import { ArtisanProfileHistory } from './entities/artisan-profile-history.entity';
import { ArtisanProfileHistoryTimeline } from './entities/artisan-profile-history-timeline.entity';

export const artisanProfileHistoryProviders = [
  {
    provide: 'ARTISAN_PROFILE_HISTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanProfileHistory),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ARTISAN_PROFILE_HISTORY_TIMELINE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ArtisanProfileHistoryTimeline),
    inject: ['DATA_SOURCE'],
  },
];
