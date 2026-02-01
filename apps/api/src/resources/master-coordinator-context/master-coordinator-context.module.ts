import { Module, forwardRef } from '@nestjs/common';
import { MasterCoordinatorContextService } from './master-coordinator-context.service';
import { MasterCoordinatorContextController } from './master-coordinator-context.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { masterCoordinatorContextProviders } from './master-coordinator-context.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [MasterCoordinatorContextController],
  providers: [
    ...masterCoordinatorContextProviders,
    MasterCoordinatorContextService,
  ],
  exports: [
    MasterCoordinatorContextService,
    ...masterCoordinatorContextProviders,
  ],
})
export class MasterCoordinatorContextModule {}
