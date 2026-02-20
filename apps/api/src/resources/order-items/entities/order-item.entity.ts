import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'order_items', schema: 'payments' })
export class OrderItem extends BaseEntity {
  @ApiProperty({ description: 'ID único del item de la orden' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID de la orden',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
  })
  @Column({ type: 'integer' })
  quantity!: number;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
  })
  @Column({ type: 'char', length: 3 })
  currency!: string;

  @ApiProperty({
    description: 'Precio unitario en menores (centavos)',
    example: '5000000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'unit_price_minor' })
  unitPriceMinor!: string;

  @ApiProperty({
    description: 'Total de la línea en menores (centavos)',
    example: '10000000',
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'line_total_minor' })
  lineTotalMinor!: string;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    example: { color: 'azul', size: 'L' },
  })
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Orden a la que pertenece el item' })
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ApiProperty({ description: 'Producto en la orden' })
  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
