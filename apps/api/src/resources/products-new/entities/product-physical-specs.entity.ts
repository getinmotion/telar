import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_PHYSICAL_SPECS - Especificaciones físicas del producto
 * Dimensiones y peso real
 */
@Entity({ schema: 'shop', name: 'product_physical_specs' })
export class ProductPhysicalSpecs {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'height_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  heightCm: number;

  @Column({ name: 'width_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  widthCm: number;

  @Column({ name: 'length_or_diameter_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  lengthOrDiameterCm: number;

  @Column({ name: 'real_weight_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  realWeightKg: number;

  // Relación
  @OneToOne(() => ProductCore, (product) => product.physicalSpecs)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
