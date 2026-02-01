import { Module, forwardRef } from '@nestjs/common';
import { UserMaturityScoresService } from './user-maturity-scores.service';
import { UserMaturityScoresController } from './user-maturity-scores.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { userMaturityScoresProviders } from './user-maturity-scores.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserMaturityScoresController],
  providers: [...userMaturityScoresProviders, UserMaturityScoresService],
  exports: [UserMaturityScoresService, ...userMaturityScoresProviders],
})
export class UserMaturityScoresModule {}
