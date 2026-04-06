import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'payment_providers', schema: 'payments' })
export class PaymentProvider extends BaseEntity {
  @ApiProperty({ description: 'ID único del proveedor de pago' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Código único del proveedor',
    example: 'wompi',
  })
  @Column({ type: 'text', unique: true })
  code!: string;

  @ApiProperty({
    description: 'Nombre para mostrar del proveedor',
    example: 'Wompi',
  })
  @Column({ type: 'text', name: 'display_name' })
  displayName!: string;

  @ApiProperty({
    description: 'Indica si el proveedor está activo',
    default: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @ApiProperty({
    description: 'Capacidades y configuración del proveedor en formato JSON',
    example: { supportsCreditCard: true, supportsNequi: true },
  })
  @Column({ type: 'jsonb', default: {} })
  capabilities!: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
