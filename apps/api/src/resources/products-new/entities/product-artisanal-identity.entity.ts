import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_ARTISANAL_IDENTITY - Identidad artesanal del producto
 * Captura craft, technique, estilo, proceso, etc.
 */
@Entity({ schema: 'shop', name: 'product_artisanal_identity' })
export class ProductArtisanalIdentity {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'primary_craft_id', type: 'uuid', nullable: true })
  primaryCraftId: string;

  @Column({ name: 'primary_technique_id', type: 'uuid', nullable: true })
  primaryTechniqueId: string;

  @Column({ name: 'secondary_technique_id', type: 'uuid', nullable: true })
  secondaryTechniqueId: string;

  @Column({ name: 'curatorial_category_id', type: 'uuid', nullable: true })
  curatorialCategoryId: string;

  @Column({ name: 'piece_type', type: 'varchar', nullable: true })
  pieceType: string; // 'funcional', 'decorativa', 'mixta'

  @Column({ type: 'varchar', nullable: true })
  style: string; // 'tradicional', 'contemporaneo', 'fusion'

  @Column({ name: 'is_collaboration', type: 'boolean', default: false })
  isCollaboration: boolean;

  @Column({ name: 'process_type', type: 'varchar', nullable: true })
  processType: string; // 'manual', 'mixto', 'asistido'

  @Column({ name: 'estimated_elaboration_time', type: 'text', nullable: true })
  estimatedElaborationTime: string;

  // Relación
  @OneToOne(() => ProductCore, (product) => product.artisanalIdentity)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
