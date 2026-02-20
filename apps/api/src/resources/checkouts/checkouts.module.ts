import { forwardRef, Module } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { CheckoutsController } from './checkouts.controller';
import { checkoutsProviders } from './checkouts.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [CheckoutsController],
  providers: [...checkoutsProviders, CheckoutsService],
  exports: [CheckoutsService],
})
export class CheckoutsModule {}
