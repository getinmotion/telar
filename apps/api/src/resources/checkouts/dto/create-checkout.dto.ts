import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Matches,
  IsUUID,
} from 'class-validator';
import { SaleContext, CheckoutStatus } from '../entities/checkout.entity';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'El cartId debe ser un UUID válido' })
  @IsNotEmpty()
  cartId!: string;

  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'El buyerUserId debe ser un UUID válido' })
  @IsNotEmpty()
  buyerUserId!: string;

  @ApiProperty({
    description: 'Contexto de venta',
    enum: SaleContext,
    example: SaleContext.MARKETPLACE,
  })
  @IsEnum(SaleContext, { message: 'El contexto debe ser marketplace o tenant' })
  @IsNotEmpty()
  context!: SaleContext;

  @ApiProperty({
    description: 'ID de la tienda de contexto (requerido solo para tenant)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID(4, { message: 'El contextShopId debe ser un UUID válido' })
  @IsOptional()
  contextShopId?: string;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, {
    message: 'La moneda debe ser un código ISO 4217 de 3 letras mayúsculas',
  })
  currency!: string;

  @ApiProperty({
    description: 'Estado del checkout',
    enum: CheckoutStatus,
    example: CheckoutStatus.CREATED,
    default: CheckoutStatus.CREATED,
    required: false,
  })
  @IsEnum(CheckoutStatus)
  @IsOptional()
  status?: CheckoutStatus;

  @ApiProperty({
    description: 'Subtotal en menores (centavos)',
    example: '10000000',
    default: '0',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'El subtotal debe ser un número entero positivo',
  })
  subtotalMinor?: string;

  @ApiProperty({
    description: 'Total de cargos en menores (centavos)',
    example: '500000',
    default: '0',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'El total de cargos debe ser un número entero positivo',
  })
  chargesTotalMinor?: string;

  @ApiProperty({
    description: 'Total en menores (centavos)',
    example: '10500000',
    default: '0',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'El total debe ser un número entero positivo',
  })
  totalMinor?: string;

  @ApiProperty({
    description: 'Clave de idempotencia única',
    example: 'checkout_abc123_unique',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}
