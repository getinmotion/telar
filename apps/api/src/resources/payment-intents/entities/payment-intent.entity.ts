import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '../../payment-providers/entities/payment-provider.entity';

export enum PaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

@Entity({ name: 'payment_intents', schema: 'payments' })
export class PaymentIntent extends BaseEntity {
  @ApiProperty({ description: 'ID único del intent de pago' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del checkout asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'checkout_id' })
  checkoutId!: string;

  @ApiProperty({
    description: 'ID del proveedor de pago',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'provider_id' })
  providerId!: string;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
  })
  @Column({ type: 'char', length: 3 })
  currency!: string;

  @ApiProperty({
    description: 'Monto en menores (centavos)',
    example: 5000000,
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'amount_minor' })
  amountMinor!: string;

  @ApiProperty({
    description: 'Estado del intent de pago',
    enum: PaymentIntentStatus,
    example: PaymentIntentStatus.REQUIRES_PAYMENT_METHOD,
  })
  @Column({ type: 'text', default: 'requires_payment_method' })
  status!: string;

  @ApiProperty({
    description: 'ID externo del intent en el proveedor de pago',
    example: 'ch_3MtwBwLkdIwHu7ix0snN0B15',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', name: 'external_intent_id', nullable: true })
  externalIntentId?: string | null;

  @ApiProperty({
    description: 'Datos del proveedor en formato JSON',
    example: { paymentMethodType: 'CARD', reference: 'REF123' },
  })
  @Column({ type: 'jsonb', name: 'provider_data', default: {} })
  providerData!: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Proveedor de pago' })
  @ManyToOne(() => PaymentProvider, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider!: PaymentProvider;
}
