import { Module, forwardRef } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { userProfilesProviders } from './user-profiles.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserProfilesController],
  providers: [...userProfilesProviders, UserProfilesService],
  exports: [UserProfilesService, ...userProfilesProviders],
})
export class UserProfilesModule {}
