import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID del checkout',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  checkoutId!: string;

  @ApiProperty({
    description: 'ID de la tienda vendedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  sellerShopId!: string;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency!: string;

  @ApiProperty({
    description: 'Subtotal bruto en menores (centavos)',
    example: '10000000',
    minimum: 0,
  })
  @IsString()
  @IsNotEmpty()
  grossSubtotalMinor!: string;

  @ApiProperty({
    description: 'Neto para el vendedor en menores (centavos)',
    example: '9500000',
    minimum: 0,
  })
  @IsString()
  @IsNotEmpty()
  netToSellerMinor!: string;

  @ApiProperty({
    description: 'Estado de la orden',
    enum: OrderStatus,
    example: OrderStatus.PENDING_FULFILLMENT,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
