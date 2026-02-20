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
import { ArtisanShop } from '../../artisan-shops/entities/artisan-shop.entity';
import { Checkout } from '../../checkouts/entities/checkout.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

export enum OrderStatus {
  PENDING_FULFILLMENT = 'pending_fulfillment',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

@Entity({ name: 'orders', schema: 'payments' })
export class Order extends BaseEntity {
  @ApiProperty({ description: 'ID único de la orden' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del checkout',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'checkout_id' })
  checkoutId!: string;

  @ApiProperty({
    description: 'ID de la tienda vendedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'seller_shop_id' })
  sellerShopId!: string;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
  })
  @Column({ type: 'char', length: 3 })
  currency!: string;

  @ApiProperty({
    description: 'Subtotal bruto en menores (centavos)',
    example: '10000000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'gross_subtotal_minor' })
  grossSubtotalMinor!: string;

  @ApiProperty({
    description: 'Neto para el vendedor en menores (centavos)',
    example: '9500000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'net_to_seller_minor' })
  netToSellerMinor!: string;

  @ApiProperty({
    description: 'Estado de la orden',
    enum: OrderStatus,
    example: OrderStatus.PENDING_FULFILLMENT,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_FULFILLMENT,
  })
  status!: OrderStatus;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Checkout asociado' })
  @ManyToOne(() => Checkout, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checkout_id' })
  checkout!: Checkout;

  @ApiProperty({ description: 'Tienda vendedora' })
  @ManyToOne(() => ArtisanShop, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_shop_id' })
  sellerShop!: ArtisanShop;

  @ApiProperty({ description: 'Items de la orden', type: () => [OrderItem] })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems!: OrderItem[];
}
