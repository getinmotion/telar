import { PartialType } from '@nestjs/swagger';
import { CreatePaymentProviderDto } from './create-payment-provider.dto';

export class UpdatePaymentProviderDto extends PartialType(CreatePaymentProviderDto) {}
