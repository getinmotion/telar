import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'products_core', schema: 'shop' })
export class ProductCore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', name: 'short_description' })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  history: string | null;

  @Column({ type: 'text', name: 'care_notes', nullable: true })
  careNotes: string | null;

  @Column({
    type: 'text',
    default: 'draft',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'timestamp with time zone', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Relations loaded via separate queries in service
  artisanalIdentity?: ProductArtisanalIdentity;
  materials?: ProductMaterialLink[];
  physicalSpecs?: ProductPhysicalSpecs;
  production?: ProductProduction;
  media?: ProductMedia[];
  variants?: ProductVariantV2[];
}

@Entity({ name: 'product_artisanal_identity', schema: 'shop' })
export class ProductArtisanalIdentity {
  @Column({ type: 'uuid', name: 'product_id', primary: true })
  productId: string;

  @Column({ type: 'uuid', name: 'primary_craft_id', nullable: true })
  primaryCraftId: string | null;

  @Column({ type: 'uuid', name: 'primary_technique_id', nullable: true })
  primaryTechniqueId: string | null;

  @Column({ type: 'uuid', name: 'secondary_technique_id', nullable: true })
  secondaryTechniqueId: string | null;

  @Column({ type: 'uuid', name: 'curatorial_category_id', nullable: true })
  curatorialCategoryId: string | null;

  @Column({ type: 'enum', enum: ['funcional', 'decorativa', 'mixta'], name: 'piece_type', nullable: true })
  pieceType: string | null;

  @Column({ type: 'enum', enum: ['tradicional', 'contemporaneo', 'fusion'], nullable: true })
  style: string | null;

  @Column({ type: 'boolean', name: 'is_collaboration', default: false })
  isCollaboration: boolean;

  @Column({ type: 'enum', enum: ['manual', 'mixto', 'asistido'], name: 'process_type', nullable: true })
  processType: string | null;

  @Column({ type: 'text', name: 'estimated_elaboration_time', nullable: true })
  estimatedElaborationTime: string | null;
}

@Entity({ name: 'product_materials_link', schema: 'shop' })
export class ProductMaterialLink {
  @Column({ type: 'uuid', name: 'product_id', primary: true })
  productId: string;

  @Column({ type: 'uuid', name: 'material_id', primary: true })
  materialId: string;

  @Column({ type: 'boolean', name: 'is_primary', default: true })
  isPrimary: boolean;

  @Column({ type: 'text', name: 'material_origin', nullable: true })
  materialOrigin: string | null;
}

@Entity({ name: 'product_physical_specs', schema: 'shop' })
export class ProductPhysicalSpecs {
  @Column({ type: 'uuid', name: 'product_id', primary: true })
  productId: string;

  @Column({ type: 'numeric', precision: 8, scale: 2, name: 'height_cm', nullable: true })
  heightCm: number | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, name: 'width_cm', nullable: true })
  widthCm: number | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, name: 'length_or_diameter_cm', nullable: true })
  lengthOrDiameterCm: number | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, name: 'real_weight_kg', nullable: true })
  realWeightKg: number | null;
}

@Entity({ name: 'product_production', schema: 'shop' })
export class ProductProduction {
  @Column({ type: 'uuid', name: 'product_id', primary: true })
  productId: string;

  @Column({ type: 'enum', enum: ['en_stock', 'bajo_pedido', 'edicion_limitada'], name: 'availability_type' })
  availabilityType: string;

  @Column({ type: 'integer', name: 'production_time_days', nullable: true })
  productionTimeDays: number | null;

  @Column({ type: 'integer', name: 'monthly_capacity', nullable: true })
  monthlyCapacity: number | null;

  @Column({ type: 'text', name: 'requirements_to_start', nullable: true })
  requirementsToStart: string | null;
}

@Entity({ name: 'product_media', schema: 'shop' })
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'text', name: 'media_url' })
  mediaUrl: string;

  @Column({ type: 'text', name: 'media_type', default: 'image' })
  mediaType: string;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'integer', name: 'display_order', default: 0 })
  displayOrder: number;
}

@Entity({ name: 'product_variants', schema: 'shop' })
export class ProductVariantV2 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'text', nullable: true, unique: true })
  sku: string | null;

  @Column({ type: 'integer', name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ type: 'bigint', name: 'base_price_minor' })
  basePriceMinor: number;

  @Column({ type: 'char', length: 3, default: 'COP' })
  currency: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
