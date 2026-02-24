import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncCartItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({
    description: 'ID de la variante del producto',
    example: 'size-M-color-red',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class SyncGuestCartDto {
  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  buyerUserId!: string;

  @ApiProperty({
    description: 'Array de productos del carrito invitado',
    type: [SyncCartItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items!: SyncCartItemDto[];
}

export class SyncGuestCartResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'ID del carrito creado o reutilizado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cartId!: string;

  @ApiProperty({
    description: 'Número de items creados o actualizados',
    example: 3,
  })
  itemsCreated!: number;
}
