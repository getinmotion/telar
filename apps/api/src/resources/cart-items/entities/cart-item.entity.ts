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
import { Product } from '../../products/entities/product.entity';
import { ArtisanShop } from '../../artisan-shops/entities/artisan-shop.entity';

export enum PriceSource {
  PRODUCT_BASE = 'product_base',
  OVERRIDE = 'override',
}

@Entity({ name: 'cart_items', schema: 'payments' })
export class CartItem extends BaseEntity {
  @ApiProperty({ description: 'ID único del item del carrito' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId!: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ApiProperty({
    description: 'ID de la tienda vendedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'seller_shop_id' })
  sellerShopId!: string;

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
    example: 5000000,
    minimum: 0,
  })
  @Column({ type: 'bigint', name: 'unit_price_minor' })
  unitPriceMinor!: string;

  @ApiProperty({
    description: 'Fuente del precio',
    enum: PriceSource,
    example: PriceSource.PRODUCT_BASE,
  })
  @Column({ type: 'text', name: 'price_source' })
  priceSource!: string;

  @ApiProperty({
    description: 'ID de referencia del precio (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'price_ref_id', nullable: true })
  priceRefId?: string | null;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    example: { color: 'rojo', size: 'M' },
  })
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Carrito al que pertenece el item' })
  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @ApiProperty({ description: 'Producto en el carrito' })
  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ApiProperty({ description: 'Tienda vendedora' })
  @ManyToOne(() => ArtisanShop, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_shop_id' })
  sellerShop!: ArtisanShop;
}
