import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum GiftCardStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DEPLETED = 'depleted',
  BLOCKED = 'blocked',
}

@Entity({ name: 'gift_cards', schema: 'public' })
export class GiftCard extends BaseEntity {
  @ApiProperty({ description: 'ID único de la gift card' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Código único de la gift card',
    example: 'GC-ABCD-1234',
  })
  @Column({ type: 'text', unique: true })
  code!: string;

  @ApiProperty({
    description: 'Monto inicial',
    example: 100000,
  })
  @Column({ type: 'numeric', name: 'initial_amount' })
  initialAmount!: string;

  @ApiProperty({
    description: 'Monto restante',
    example: 50000,
  })
  @Column({ type: 'numeric', name: 'remaining_amount' })
  remainingAmount!: string;

  @ApiProperty({
    description: 'Código de moneda',
    example: 'COP',
    default: 'COP',
  })
  @Column({ type: 'text', default: 'COP', nullable: true })
  currency?: string;

  @ApiProperty({
    description: 'Estado de la gift card',
    enum: GiftCardStatus,
    example: GiftCardStatus.ACTIVE,
  })
  @Column({
    type: 'text',
    default: GiftCardStatus.ACTIVE,
  })
  status!: GiftCardStatus;

  @ApiProperty({
    description: 'Fecha de expiración',
    required: false,
    nullable: true,
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'expiration_date',
    nullable: true,
  })
  expirationDate?: Date | null;

  @ApiProperty({
    description: 'Email del comprador',
    example: 'comprador@example.com',
  })
  @Column({ type: 'text', name: 'purchaser_email' })
  purchaserEmail!: string;

  @ApiProperty({
    description: 'Email del destinatario',
    example: 'destinatario@example.com',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', name: 'recipient_email', nullable: true })
  recipientEmail?: string | null;

  @ApiProperty({
    description: 'Mensaje personalizado',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @ApiProperty({
    description: 'ID de orden de marketplace',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', name: 'marketplace_order_id', nullable: true })
  marketplaceOrderId?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Monto original (campo legacy)',
    required: false,
    nullable: true,
  })
  @Column({ type: 'numeric', name: 'original_amount', nullable: true })
  originalAmount?: string | null;

  @ApiProperty({
    description: 'ID de orden',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', name: 'order_id', nullable: true })
  orderId?: string | null;

  @ApiProperty({
    description: 'Indica si está activa',
    default: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true, nullable: true })
  isActive?: boolean;

  @ApiProperty({
    description: 'Fecha de expiración (campo legacy)',
    required: false,
    nullable: true,
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'expires_at',
    nullable: true,
  })
  expiresAt?: Date | null;
}
