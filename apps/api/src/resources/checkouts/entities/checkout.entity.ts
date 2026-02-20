import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../../cart/entities/cart.entity';
import { User } from '../../users/entities/user.entity';
import { ArtisanShop } from '../../artisan-shops/entities/artisan-shop.entity';
import { Order } from '../../orders/entities/order.entity';

export enum SaleContext {
  MARKETPLACE = 'marketplace',
  TENANT = 'tenant',
}

export enum CheckoutStatus {
  CREATED = 'created',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded',
}

@Entity({ name: 'checkouts', schema: 'payments' })
export class Checkout extends BaseEntity {
  @ApiProperty({ description: 'ID único del checkout' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId!: string;

  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'buyer_user_id' })
  buyerUserId!: string;

  @ApiProperty({
    description: 'Contexto de venta',
    enum: SaleContext,
    example: SaleContext.MARKETPLACE,
  })
  @Column({ type: 'enum', enum: SaleContext })
  context!: SaleContext;

  @ApiProperty({
    description: 'ID de la tienda de contexto (solo para tenant)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @Column({ type: 'uuid', name: 'context_shop_id', nullable: true })
  contextShopId?: string;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
  })
  @Column({ type: 'char', length: 3 })
  currency!: string;

  @ApiProperty({
    description: 'Estado del checkout',
    enum: CheckoutStatus,
    example: CheckoutStatus.CREATED,
  })
  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.CREATED,
  })
  status!: CheckoutStatus;

  @ApiProperty({
    description: 'Subtotal en menores (centavos)',
    example: '10000000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'subtotal_minor', default: 0 })
  subtotalMinor!: string;

  @ApiProperty({
    description: 'Total de cargos en menores (centavos)',
    example: '500000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'charges_total_minor', default: 0 })
  chargesTotalMinor!: string;

  @ApiProperty({
    description: 'Total en menores (centavos)',
    example: '10500000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'total_minor', default: 0 })
  totalMinor!: string;

  @ApiProperty({
    description: 'Clave de idempotencia',
    example: 'checkout_abc123_unique',
  })
  @Column({ type: 'text', name: 'idempotency_key', unique: true })
  idempotencyKey!: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Carrito asociado' })
  @ManyToOne(() => Cart, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @ApiProperty({ description: 'Usuario comprador' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_user_id' })
  buyerUser!: User;

  @ApiProperty({ description: 'Tienda de contexto', required: false })
  @ManyToOne(() => ArtisanShop, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'context_shop_id' })
  contextShop?: ArtisanShop;

  @ApiProperty({ description: 'Órdenes del checkout', type: () => [Order] })
  @OneToMany(() => Order, (order) => order.checkout)
  orders!: Order[];
}
