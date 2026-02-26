import { PartialType } from '@nestjs/swagger';
import { CreateCartShippingInfoDto } from './create-cart-shipping-info.dto';

export class UpdateCartShippingInfoDto extends PartialType(
  CreateCartShippingInfoDto,
) {}
