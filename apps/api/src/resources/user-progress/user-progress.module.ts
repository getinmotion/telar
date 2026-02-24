import { Module, forwardRef } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { userProgressProviders } from './user-progress.providers';
import { AuthModule } from '../auth/auth.module';
import { UserAchievementsModule } from '../user-achievements/user-achievements.module';
import { UserMaturityScoresModule } from '../user-maturity-scores/user-maturity-scores.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserAchievementsModule),
    forwardRef(() => UserMaturityScoresModule),
  ],
  controllers: [UserProgressController],
  providers: [...userProgressProviders, UserProgressService],
  exports: [UserProgressService, ...userProgressProviders],
})
export class UserProgressModule {}
