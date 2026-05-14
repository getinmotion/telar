import { PartialType } from '@nestjs/swagger';
import { CreateStorePoliciesConfigDto } from './create-store-policies-config.dto';

export class UpdateStorePoliciesConfigDto extends PartialType(
  CreateStorePoliciesConfigDto,
) {}
