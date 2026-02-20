import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { GiftCardStatus } from '../entities/gift-card.entity';

export class CreateGiftCardDto {
  @ApiProperty({
    description: 'Código único de la gift card',
    example: 'GC-ABCD-1234',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Monto inicial (debe ser mayor a 0)',
    example: '100000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'El monto inicial debe ser un número válido',
  })
  initialAmount!: string;

  @ApiProperty({
    description: 'Monto restante (debe ser mayor o igual a 0)',
    example: '100000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'El monto restante debe ser un número válido',
  })
  remainingAmount!: string;

  @ApiProperty({
    description: 'Código de moneda',
    example: 'COP',
    default: 'COP',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Estado de la gift card',
    enum: GiftCardStatus,
    example: GiftCardStatus.ACTIVE,
    default: GiftCardStatus.ACTIVE,
    required: false,
  })
  @IsEnum(GiftCardStatus)
  @IsOptional()
  status?: GiftCardStatus;

  @ApiProperty({
    description: 'Fecha de expiración',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty({
    description: 'Email del comprador',
    example: 'comprador@example.com',
  })
  @IsEmail({}, { message: 'El email del comprador debe ser válido' })
  @IsNotEmpty()
  purchaserEmail!: string;

  @ApiProperty({
    description: 'Email del destinatario',
    example: 'destinatario@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'El email del destinatario debe ser válido' })
  @IsOptional()
  recipientEmail?: string;

  @ApiProperty({
    description: 'Mensaje personalizado',
    example: '¡Feliz cumpleaños!',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'ID de orden de marketplace',
    example: 'order_abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  marketplaceOrderId?: string;

  @ApiProperty({
    description: 'Monto original (campo legacy)',
    example: '100000',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'El monto original debe ser un número válido',
  })
  originalAmount?: string;

  @ApiProperty({
    description: 'ID de orden',
    example: 'order_123',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: 'Indica si está activa',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Fecha de expiración (campo legacy)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  expiresAt?: Date;
}
