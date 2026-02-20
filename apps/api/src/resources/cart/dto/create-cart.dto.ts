import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { SaleContext } from '../entities/cart.entity';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  buyerUserId!: string;

  @ApiProperty({
    description: 'Contexto de la venta',
    enum: SaleContext,
    example: SaleContext.MARKETPLACE,
    required: false,
  })
  @IsEnum(SaleContext)
  @IsOptional()
  context?: SaleContext;

  @ApiProperty({
    description: 'ID de la tienda (requerido si context es tenant)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  contextShopId?: string | null;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
    minLength: 3,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;
}
