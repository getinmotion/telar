import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

/**
 * DTO para recibir notificaciones de webhook del servicio payment-svc
 *
 * Este payload es enviado por el servicio de Go cuando un pago
 * es confirmado (PAID) o rechazado (FAILED).
 */
export class PaymentWebhookDto {
  @ApiProperty({
    description: 'Código del gateway de pago',
    example: 'wompi',
    enum: ['wompi', 'cobre'],
  })
  @IsString()
  @IsNotEmpty()
  gateway_code: string;

  @ApiProperty({
    description: 'ID de la transacción del PaymentIntent',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({
    description: 'ID del carrito asociado al pago',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  cart_id: string;

  @ApiProperty({
    description: 'Estado del pago',
    example: 'PAID',
    enum: ['PAID', 'FAILED'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['PAID', 'FAILED'])
  status: string;
}
