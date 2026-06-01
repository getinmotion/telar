import { Module, forwardRef } from '@nestjs/common';
import { MarketplaceAssignmentsService } from './marketplace-assignments.service';
import { MarketplaceAssignmentsController } from './marketplace-assignments.controller';
import { marketplaceAssignmentsProviders } from './marketplace-assignments.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [MarketplaceAssignmentsController],
  providers: [...marketplaceAssignmentsProviders, MarketplaceAssignmentsService],
  exports: [MarketplaceAssignmentsService],
})
export class MarketplaceAssignmentsModule {}
