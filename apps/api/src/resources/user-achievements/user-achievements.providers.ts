import { DataSource } from 'typeorm';
import { UserAchievement } from './entities/user-achievement.entity';

export const userAchievementsProviders = [
  {
    provide: 'USER_ACHIEVEMENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserAchievement),
    inject: ['DATA_SOURCE'],
  },
];
