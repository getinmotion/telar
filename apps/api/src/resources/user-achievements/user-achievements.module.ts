import { Module, forwardRef } from '@nestjs/common';
import { UserAchievementsService } from './user-achievements.service';
import { UserAchievementsController } from './user-achievements.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { userAchievementsProviders } from './user-achievements.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserAchievementsController],
  providers: [...userAchievementsProviders, UserAchievementsService],
  exports: [UserAchievementsService, ...userAchievementsProviders],
})
export class UserAchievementsModule {}
