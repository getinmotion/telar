import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { paymentsProviders } from './payments.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { MailModule } from '../mail/mail.module';
import { ServientregaModule } from '../servientrega/servientrega.module';
import { ProductIdentityModule } from '../product-identity/product-identity.module';

@Module({
  imports: [DatabaseModule, MailModule, ServientregaModule, ProductIdentityModule],
  controllers: [PaymentsController],
  providers: [...paymentsProviders, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
