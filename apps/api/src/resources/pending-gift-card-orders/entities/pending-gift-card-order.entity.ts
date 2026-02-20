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
import { Cart } from '../../cart/entities/cart.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'pending_gift_card_orders', schema: 'payments' })
export class PendingGiftCardOrder extends BaseEntity {
  @ApiProperty({ description: 'ID único de la orden pendiente' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId!: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ApiProperty({
    description: 'Email del comprador',
    example: 'comprador@example.com',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255, name: 'purchaser_email' })
  purchaserEmail!: string;

  @ApiProperty({
    description: 'Array de items (objetos)',
    example: [
      { productId: 'abc123', quantity: 2, price: 50000 },
      { productId: 'def456', quantity: 1, price: 100000 },
    ],
  })
  @Column({ type: 'jsonb', default: [] })
  items!: Array<Record<string, any>>;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de procesamiento',
    required: false,
    nullable: true,
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'processed_at',
    nullable: true,
  })
  processedAt?: Date | null;

  // Relaciones
  @ApiProperty({ description: 'Carrito asociado' })
  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @ApiProperty({ description: 'Usuario comprador' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
