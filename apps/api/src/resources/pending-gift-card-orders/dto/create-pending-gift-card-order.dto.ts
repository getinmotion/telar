import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEmail,
  IsArray,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreatePendingGiftCardOrderDto {
  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  cartId!: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Email del comprador',
    example: 'comprador@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  purchaserEmail!: string;

  @ApiProperty({
    description: 'Array de items (objetos)',
    example: [
      { productId: 'abc123', quantity: 2, price: 50000 },
      { productId: 'def456', quantity: 1, price: 100000 },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  items?: Array<Record<string, any>>;
}
