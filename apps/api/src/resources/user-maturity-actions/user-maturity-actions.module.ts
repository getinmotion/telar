import { Module, forwardRef } from '@nestjs/common';
import { UserMaturityActionsService } from './user-maturity-actions.service';
import { UserMaturityActionsController } from './user-maturity-actions.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { userMaturityActionsProviders } from './user-maturity-actions.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserMaturityActionsController],
  providers: [...userMaturityActionsProviders, UserMaturityActionsService],
  exports: [UserMaturityActionsService, ...userMaturityActionsProviders],
})
export class UserMaturityActionsModule {}
