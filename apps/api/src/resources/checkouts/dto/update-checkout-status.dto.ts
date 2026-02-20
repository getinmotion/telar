import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CheckoutStatus } from '../entities/checkout.entity';

export class UpdateCheckoutStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del checkout',
    enum: CheckoutStatus,
    example: CheckoutStatus.PAID,
  })
  @IsEnum(CheckoutStatus, {
    message: 'El status debe ser un valor válido del enum CheckoutStatus',
  })
  @IsNotEmpty()
  status!: CheckoutStatus;
}
