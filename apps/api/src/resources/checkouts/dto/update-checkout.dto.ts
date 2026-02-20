import { PartialType } from '@nestjs/swagger';
import { CreateCheckoutDto } from './create-checkout.dto';

export class UpdateCheckoutDto extends PartialType(CreateCheckoutDto) {}
