import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'notifications', schema: 'public' })
@Index('idx_notifications_user_id', ['userId'])
@Index('idx_notifications_read', ['userId', 'read'])
export class Notification extends BaseEntity {
  @ApiProperty({ description: 'ID único de la notificación' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    example: 'order_update',
    enum: [
      'order_update',
      'payment_confirmed',
      'shipping_update',
      'product_approved',
      'message_received',
      'system_alert',
    ],
  })
  @Column({ type: 'text' })
  type!: string;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nueva orden recibida',
  })
  @Column({ type: 'text' })
  title!: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Has recibido una nueva orden #12345',
  })
  @Column({ type: 'text' })
  message!: string;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    example: { orderId: '123', amount: 50000 },
  })
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @ApiProperty({
    description: 'Indica si la notificación fue leída',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @ApiProperty({ description: 'Fecha de creación de la notificación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Usuario destinatario de la notificación' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
