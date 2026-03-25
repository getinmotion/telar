import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_MATERIALS_LINK - Relación N:M con taxonomy.materials
 * Permite múltiples materiales por producto con material primario
 */
@Entity({ schema: 'shop', name: 'product_materials_link' })
export class ProductMaterialLink {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @PrimaryColumn({ name: 'material_id', type: 'uuid' })
  materialId: string;

  @Column({ name: 'is_primary', type: 'boolean', default: true })
  isPrimary: boolean;

  @Column({ name: 'material_origin', type: 'text', nullable: true })
  materialOrigin: string;

  // Relación
  @ManyToOne(() => ProductCore, (product) => product.materials)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
