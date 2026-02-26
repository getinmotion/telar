import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
} from 'class-validator';

export enum NotificationType {
  ORDER_UPDATE = 'order_update',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  SHIPPING_UPDATE = 'shipping_update',
  PRODUCT_APPROVED = 'product_approved',
  MESSAGE_RECEIVED = 'message_received',
  SYSTEM_ALERT = 'system_alert',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.ORDER_UPDATE,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nueva orden recibida',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Has recibido una nueva orden #12345',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales',
    example: { orderId: '123', amount: 50000 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
