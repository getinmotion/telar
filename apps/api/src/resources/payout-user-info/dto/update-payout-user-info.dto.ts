import { PartialType } from '@nestjs/swagger';
import { CreatePayoutUserInfoDto } from './create-payout-user-info.dto';

export class UpdatePayoutUserInfoDto extends PartialType(CreatePayoutUserInfoDto) {}
