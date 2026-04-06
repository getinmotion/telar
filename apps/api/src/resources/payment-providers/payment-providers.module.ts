import { Module } from '@nestjs/common';
import { PaymentProvidersService } from './payment-providers.service';
import { PaymentProvidersController } from './payment-providers.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { paymentProvidersProviders } from './payment-providers.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentProvidersController],
  providers: [...paymentProvidersProviders, PaymentProvidersService],
  exports: [PaymentProvidersService, ...paymentProvidersProviders],
})
export class PaymentProvidersModule {}
