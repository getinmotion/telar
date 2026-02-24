import { PartialType } from '@nestjs/swagger';
import { CreatePendingGiftCardOrderDto } from './create-pending-gift-card-order.dto';

export class UpdatePendingGiftCardOrderDto extends PartialType(CreatePendingGiftCardOrderDto) {}
