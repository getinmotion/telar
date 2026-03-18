import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

// Enums
export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

// Interfaces para campos JSONB
export interface OptionValues {
  [key: string]: string; // Ejemplo: { "color": "rojo", "talla": "M" }
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string; // 'cm', 'in', etc.
}

@Entity({ name: 'product_variants', schema: 'public' })
@Check(
  'product_variants_status_check',
  `status IN ('active', 'inactive', 'discontinued')`,
)
export class ProductVariant extends BaseEntity {
  @ApiProperty({ description: 'ID único de la variante' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del producto al que pertenece la variante' })
  @Column({ type: 'uuid', name: 'product_id' })
  @Index('idx_product_variants_product_id')
  productId: string;

  @ApiProperty({ description: 'SKU único de la variante' })
  @Column({ type: 'text', unique: true })
  @Index('idx_product_variants_sku')
  sku: string;

  @ApiPropertyOptional({
    description: 'Valores de opciones de la variante (color, talla, etc.)',
    example: { color: 'rojo', talla: 'M' },
  })
  @Column({ type: 'jsonb', name: 'option_values', default: {} })
  optionValues: OptionValues;

  @ApiPropertyOptional({ description: 'Precio de venta', example: 25000 })
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original antes de descuento)',
    example: 35000,
  })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'compare_at_price',
  })
  compareAtPrice: number | null;

  @ApiPropertyOptional({
    description: 'Costo de producción o adquisición',
    example: 15000,
  })
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  cost: number | null;

  @ApiPropertyOptional({
    description: 'Cantidad en stock',
    example: 100,
    default: 0,
  })
  @Column({ type: 'integer', nullable: true, default: 0 })
  stock: number;

  @ApiPropertyOptional({
    description: 'Stock mínimo antes de alertar',
    example: 5,
    default: 5,
  })
  @Column({ type: 'integer', nullable: true, default: 5, name: 'min_stock' })
  minStock: number;

  @ApiPropertyOptional({
    description: 'Peso de la variante en kg',
    example: 0.5,
  })
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  weight: number | null;

  @ApiPropertyOptional({
    description: 'Dimensiones de la variante (largo, ancho, alto)',
    example: { length: 20, width: 15, height: 10, unit: 'cm' },
  })
  @Column({ type: 'jsonb', nullable: true, default: {} })
  dimensions: Dimensions;

  @ApiPropertyOptional({
    description: 'Estado de la variante',
    enum: VariantStatus,
    default: VariantStatus.ACTIVE,
  })
  @Column({
    type: 'text',
    nullable: true,
    default: VariantStatus.ACTIVE,
  })
  @Index('idx_product_variants_status')
  status: VariantStatus;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
