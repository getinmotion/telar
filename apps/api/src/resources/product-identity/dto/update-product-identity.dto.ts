import { PartialType } from '@nestjs/mapped-types';
import { CreateProductIdentityDto } from './create-product-identity.dto';

export class UpdateProductIdentityDto extends PartialType(
  CreateProductIdentityDto,
) {}
