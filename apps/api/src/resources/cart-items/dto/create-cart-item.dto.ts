import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Min,
  Length,
  IsObject,
  IsIn,
} from 'class-validator';
import { PriceSource } from '../entities/cart-item.entity';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  cartId!: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'ID de la tienda vendedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  sellerShopId!: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;

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
    description: 'Precio unitario en menores (centavos)',
    example: '5000000',
    minimum: 0,
  })
  @IsString()
  @IsNotEmpty()
  unitPriceMinor!: string;

  @ApiProperty({
    description: 'Fuente del precio',
    enum: PriceSource,
    example: PriceSource.PRODUCT_BASE,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([PriceSource.PRODUCT_BASE, PriceSource.OVERRIDE])
  priceSource!: string;

  @ApiProperty({
    description: 'ID de referencia del precio (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  priceRefId?: string | null;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    example: { color: 'rojo', size: 'M' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
