import { Module, forwardRef } from '@nestjs/common';
import { UserMasterContextService } from './user-master-context.service';
import { UserMasterContextController } from './user-master-context.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { userMasterContextProviders } from './user-master-context.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserMasterContextController],
  providers: [...userMasterContextProviders, UserMasterContextService],
  exports: [UserMasterContextService, ...userMasterContextProviders],
})
export class UserMasterContextModule {}
