import { Module, forwardRef } from '@nestjs/common';
import { StorePoliciesConfigService } from './store-policies-config.service';
import { StorePoliciesConfigController } from './store-policies-config.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { storePoliciesConfigProviders } from './store-policies-config.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [StorePoliciesConfigController],
  providers: [...storePoliciesConfigProviders, StorePoliciesConfigService],
  exports: [StorePoliciesConfigService, ...storePoliciesConfigProviders],
})
export class StorePoliciesConfigModule {}
