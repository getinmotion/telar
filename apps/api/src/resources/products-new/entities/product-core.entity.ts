import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { ProductArtisanalIdentity } from './product-artisanal-identity.entity';
import { ProductPhysicalSpecs } from './product-physical-specs.entity';
import { ProductLogistics } from './product-logistics.entity';
import { ProductProduction } from './product-production.entity';
import { ProductMedia } from './product-media.entity';
import { ProductBadge } from './product-badge.entity';
import { ProductMaterialLink } from './product-material-link.entity';
import { ProductVariant } from './product-variant.entity';

/**
 * PRODUCTS_CORE - Tabla núcleo del nuevo sistema de productos multicapa
 * Contiene solo información esencial e inmutable del producto
 */
@Entity({ schema: 'shop', name: 'products_core' })
export class ProductCore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column({ name: 'legacy_product_id', type: 'uuid', nullable: true })
  legacyProductId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'short_description', type: 'text' })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  history: string;

  @Column({ name: 'care_notes', type: 'text', nullable: true })
  careNotes: string;

  @Column({
    type: 'text',
    default: 'draft',
  })
  status: string; // 'draft', 'published', 'archived'

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relaciones
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToOne(
    () => ProductArtisanalIdentity,
    (identity) => identity.product,
    { cascade: true },
  )
  artisanalIdentity: ProductArtisanalIdentity;

  @OneToOne(() => ProductPhysicalSpecs, (specs) => specs.product, {
    cascade: true,
  })
  physicalSpecs: ProductPhysicalSpecs;

  @OneToOne(() => ProductLogistics, (logistics) => logistics.product, {
    cascade: true,
  })
  logistics: ProductLogistics;

  @OneToOne(() => ProductProduction, (production) => production.product, {
    cascade: true,
  })
  production: ProductProduction;

  @OneToMany(() => ProductMedia, (media) => media.product, { cascade: true })
  media: ProductMedia[];

  @OneToMany(() => ProductBadge, (badge) => badge.product, { cascade: true })
  badges: ProductBadge[];

  @OneToMany(() => ProductMaterialLink, (material) => material.product, {
    cascade: true,
  })
  materials: ProductMaterialLink[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];
}
