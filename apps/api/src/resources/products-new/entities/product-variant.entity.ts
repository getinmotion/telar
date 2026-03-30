import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_VARIANTS - Variantes del producto (SKUs)
 * Cada variante tiene su propio precio, stock y opcionalmente dimensiones
 */
@Entity({ schema: 'shop', name: 'product_variants' })
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'text', unique: true, nullable: true })
  sku: string;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ name: 'base_price_minor', type: 'bigint' })
  basePriceMinor: number; // Precio en centavos

  @Column({ type: 'char', length: 3, default: 'COP' })
  currency: string;

  // Dimensiones propias (opcionales)
  @Column({ name: 'real_weight_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  realWeightKg: number;

  @Column({ name: 'dim_height_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  dimHeightCm: number;

  @Column({ name: 'dim_width_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  dimWidthCm: number;

  @Column({ name: 'dim_length_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  dimLengthCm: number;

  // Dimensiones de empaque (opcionales)
  @Column({ name: 'pack_height_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packHeightCm: number;

  @Column({ name: 'pack_width_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packWidthCm: number;

  @Column({ name: 'pack_length_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packLengthCm: number;

  @Column({ name: 'pack_weight_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packWeightKg: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relación
  @ManyToOne(() => ProductCore, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
