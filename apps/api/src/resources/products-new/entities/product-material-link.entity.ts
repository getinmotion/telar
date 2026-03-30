import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';
import { Material } from '../../materials/entities/material.entity';

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

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relación
  @ManyToOne(() => ProductCore, (product) => product.materials)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material?: Material;
}
