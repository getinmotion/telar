import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_LOGISTICS - Información logística del producto
 * Empaque, dimensiones de paquete, fragilidad
 */
@Entity({ schema: 'shop', name: 'product_logistics' })
export class ProductLogistics {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'packaging_type', type: 'text', nullable: true })
  packagingType: string;

  @Column({ name: 'pack_height_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packHeightCm: number;

  @Column({ name: 'pack_width_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packWidthCm: number;

  @Column({ name: 'pack_length_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packLengthCm: number;

  @Column({ name: 'pack_weight_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  packWeightKg: number;

  @Column({ type: 'varchar', default: 'medio' })
  fragility: string; // 'bajo', 'medio', 'alto'

  @Column({ name: 'requires_assembly', type: 'boolean', default: false })
  requiresAssembly: boolean;

  @Column({ name: 'special_protection_notes', type: 'text', nullable: true })
  specialProtectionNotes: string;

  // Relación
  @OneToOne(() => ProductCore, (product) => product.logistics)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
