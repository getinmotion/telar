import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CartStatus } from '../entities/cart.entity';

export class UpdateCartStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del carrito',
    enum: CartStatus,
    example: CartStatus.LOCKED,
  })
  @IsEnum(CartStatus)
  @IsNotEmpty()
  status!: CartStatus;
}
