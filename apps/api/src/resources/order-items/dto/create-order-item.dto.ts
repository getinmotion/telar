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
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID de la orden',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

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
    description: 'Total de la línea en menores (centavos)',
    example: '10000000',
    minimum: 0,
  })
  @IsString()
  @IsNotEmpty()
  lineTotalMinor!: string;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    example: { color: 'azul', size: 'L' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
