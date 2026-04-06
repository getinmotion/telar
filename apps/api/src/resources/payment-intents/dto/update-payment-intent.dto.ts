import { PartialType } from '@nestjs/swagger';
import { CreatePaymentIntentDto } from './create-payment-intent.dto';

export class UpdatePaymentIntentDto extends PartialType(CreatePaymentIntentDto) {}
