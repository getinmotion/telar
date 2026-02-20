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
import { User } from '../../users/entities/user.entity';
import { ArtisanShop } from '../../artisan-shops/entities/artisan-shop.entity';

export enum SaleContext {
  MARKETPLACE = 'marketplace',
  TENANT = 'tenant',
}

export enum CartStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  CONVERTED = 'converted',
  ABANDONED = 'abandoned',
}

@Entity({ name: 'carts', schema: 'payments' })
export class Cart extends BaseEntity {
  @ApiProperty({ description: 'ID único del carrito' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'buyer_user_id' })
  buyerUserId!: string;

  @ApiProperty({
    description: 'Contexto de la venta',
    enum: SaleContext,
    example: SaleContext.MARKETPLACE,
  })
  @Column({
    type: 'enum',
    enum: SaleContext,
    default: SaleContext.MARKETPLACE,
  })
  context!: SaleContext;

  @ApiProperty({
    description: 'ID de la tienda (contexto tenant)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'context_shop_id', nullable: true })
  contextShopId?: string | null;

  @ApiProperty({
    description: 'Código de moneda ISO 4217',
    example: 'COP',
    maxLength: 3,
  })
  @Column({ type: 'char', length: 3, default: 'COP' })
  currency!: string;

  @ApiProperty({
    description: 'Estado del carrito',
    enum: CartStatus,
    example: CartStatus.OPEN,
  })
  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.OPEN,
  })
  status!: CartStatus;

  @ApiProperty({
    description: 'Versión del carrito',
    example: 1,
  })
  @Column({ type: 'integer', default: 1 })
  version!: number;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Fecha de bloqueo del carrito',
    required: false,
    nullable: true,
  })
  @Column({ type: 'timestamp with time zone', name: 'locked_at', nullable: true })
  lockedAt?: Date | null;

  @ApiProperty({
    description: 'Fecha de conversión del carrito',
    required: false,
    nullable: true,
  })
  @Column({ type: 'timestamp with time zone', name: 'converted_at', nullable: true })
  convertedAt?: Date | null;

  // Relaciones
  @ApiProperty({ description: 'Usuario comprador' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_user_id' })
  buyer!: User;

  @ApiProperty({ description: 'Tienda de contexto (opcional)' })
  @ManyToOne(() => ArtisanShop, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'context_shop_id' })
  contextShop?: ArtisanShop | null;
}
