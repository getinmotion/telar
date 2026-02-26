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
import { Cart } from '../../cart/entities/cart.entity';

@Entity({ name: 'cart_shipping_info', schema: 'payments' })
export class CartShippingInfo extends BaseEntity {
  @ApiProperty({ description: 'ID único de la información de envío' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del carrito asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId!: string;

  @ApiProperty({
    description: 'Nombre completo del destinatario',
    example: 'Juan Pérez García',
  })
  @Column({ type: 'text', name: 'full_name' })
  fullName!: string;

  @ApiProperty({
    description: 'Correo electrónico del destinatario',
    example: 'juan.perez@example.com',
  })
  @Column({ type: 'text' })
  email!: string;

  @ApiProperty({
    description: 'Teléfono del destinatario',
    example: '+573001234567',
  })
  @Column({ type: 'text' })
  phone!: string;

  @ApiProperty({
    description: 'Dirección de envío completa',
    example: 'Calle 123 #45-67 Apto 301',
  })
  @Column({ type: 'text' })
  address!: string;

  @ApiProperty({
    description: 'Código DANE de la ciudad (5 dígitos)',
    example: 11001,
  })
  @Column({ type: 'integer', name: 'dane_ciudad' })
  daneCiudad!: number;

  @ApiProperty({
    description: 'Descripción de la ciudad',
    example: 'Bogotá D.C.',
  })
  @Column({ type: 'text', name: 'desc_ciudad' })
  descCiudad!: string;

  @ApiProperty({
    description: 'Descripción del departamento',
    example: 'Cundinamarca',
  })
  @Column({ type: 'text', name: 'desc_depart' })
  descDepart!: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
  })
  @Column({ type: 'text', name: 'postal_code' })
  postalCode!: string;

  @ApiProperty({
    description: 'Descripción del tipo de envío',
    example: 'Envío estándar - Servientrega',
  })
  @Column({ type: 'text', name: 'desc_envio' })
  descEnvio!: string;

  @ApiProperty({
    description: 'Número de guía de envío (opcional)',
    example: 'SER123456789',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', name: 'num_guia', nullable: true })
  numGuia?: string | null;

  @ApiProperty({
    description: 'Valor del flete en menores (centavos)',
    example: 1500000,
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'valor_flete_minor', default: 0 })
  valorFleteMinor!: string;

  @ApiProperty({
    description: 'Valor adicional sobre el flete en menores (centavos)',
    example: 200000,
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'valor_sobre_flete_minor', default: 0 })
  valorSobreFleteMinor!: string;

  @ApiProperty({
    description: 'Valor total del flete en menores (centavos)',
    example: 1700000,
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'valor_total_flete_minor', default: 0 })
  valorTotalFleteMinor!: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Carrito asociado' })
  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;
}
