import { Module } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentsController } from './payment-intents.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { paymentIntentsProviders } from './payment-intents.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentIntentsController],
  providers: [...paymentIntentsProviders, PaymentIntentsService],
  exports: [PaymentIntentsService, ...paymentIntentsProviders],
})
export class PaymentIntentsModule {}
