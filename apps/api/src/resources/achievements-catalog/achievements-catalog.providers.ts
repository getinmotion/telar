import { DataSource } from 'typeorm';
import { AchievementsCatalog } from './entities/achievements-catalog.entity';

export const achievementsCatalogProviders = [
  {
    provide: 'ACHIEVEMENTS_CATALOG_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AchievementsCatalog),
    inject: ['DATA_SOURCE'],
  },
];
