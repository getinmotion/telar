import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtisanShop } from '../../artisan-shops/entities/artisan-shop.entity';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';

// Enum para estado de moderación
export enum ModerationStatus {
  DRAFT = 'draft',
  PENDING_MODERATION = 'pending_moderation',
  APPROVED = 'approved',
  APPROVED_WITH_EDITS = 'approved_with_edits',
  CHANGES_REQUESTED = 'changes_requested',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

@Entity({ name: 'products', schema: 'shop' })
export class Product extends BaseEntity {
  @ApiProperty({ description: 'ID único del producto' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID de la tienda propietaria',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'shop_id' })
  shopId: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Vasija de cerámica artesanal',
  })
  @Column({ type: 'text' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción completa del producto',
    example:
      'Hermosa vasija hecha a mano por artesanos locales con técnicas tradicionales...',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Descripción corta para listados',
    example: 'Vasija artesanal de cerámica con diseños tradicionales',
  })
  @Column({ type: 'text', name: 'short_description', nullable: true })
  shortDescription: string | null;

  @ApiProperty({
    description: 'Precio del producto',
    example: 45000.0,
  })
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (antes/regular)',
    example: 60000.0,
  })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'compare_price',
    nullable: true,
  })
  comparePrice: number | null;

  @ApiPropertyOptional({
    description: 'URLs de imágenes del producto',
    example: [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
    ],
    type: [String],
  })
  @Column({ type: 'jsonb', default: '[]' })
  images: string[];

  @ApiPropertyOptional({
    description: 'Categoría del producto',
    example: 'Cerámica',
  })

  @ApiPropertyOptional({
    description: 'Subcategoría del producto',
    example: 'Decoración',
  })
  @Column({ type: 'text', nullable: true })
  subcategory: string | null;

  @ApiPropertyOptional({
    description: 'Etiquetas del producto',
    example: ['artesanal', 'hecho a mano', 'tradicional'],
    type: [String],
  })
  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @ApiPropertyOptional({
    description: 'Cantidad en inventario',
    example: 10,
    default: 0,
  })
  @Column({ type: 'integer', nullable: true, default: 0 })
  inventory: number | null;

  @ApiPropertyOptional({
    description: 'SKU (código del producto)',
    example: 'CER-VAS-001',
  })
  @Column({ type: 'text', nullable: true })
  sku: string | null;

  @ApiPropertyOptional({
    description: 'Peso en kg',
    example: 1.5,
  })
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  weight: number | null;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto (alto, ancho, largo en cm)',
    example: { height: 20, width: 15, length: 15 },
  })
  @Column({ type: 'jsonb', nullable: true })
  dimensions: object | null;

  @ApiPropertyOptional({
    description: 'Materiales utilizados',
    example: ['Arcilla', 'Esmalte natural'],
    type: [String],
  })
  @Column({ type: 'jsonb', default: '[]' })
  materials: string[];

  @ApiPropertyOptional({
    description: 'Técnicas de elaboración',
    example: ['Torno', 'Quema a leña'],
    type: [String],
  })
  @Column({ type: 'jsonb', default: '[]' })
  techniques: string[];

  @ApiPropertyOptional({
    description: 'Tiempo de producción estimado',
    example: '3-5 días',
  })
  @Column({ type: 'text', name: 'production_time', nullable: true })
  productionTime: string | null;

  @ApiPropertyOptional({
    description: 'Indica si el producto es personalizable',
    default: false,
  })
  @Column({ type: 'boolean', nullable: true, default: false })
  customizable: boolean | null;

  @ApiProperty({
    description: 'Indica si el producto está activo',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ApiProperty({
    description: 'Indica si el producto está destacado',
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @ApiPropertyOptional({
    description: 'Datos SEO del producto',
    example: { title: 'Vasija artesanal', metaDescription: '...' },
  })
  @Column({ type: 'jsonb', name: 'seo_data', default: '{}' })
  seoData: object;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de eliminación (soft delete)' })
  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiPropertyOptional({
    description: 'ID de categoría de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null;

  @ApiPropertyOptional({
    description: 'Indica si se fabrica bajo pedido',
    default: false,
  })
  @Column({ type: 'boolean', name: 'made_to_order', nullable: true, default: false })
  madeToOrder: boolean | null;

  @ApiPropertyOptional({
    description: 'Días de tiempo de entrega',
    example: 7,
    default: 7,
  })
  @Column({ type: 'integer', name: 'lead_time_days', nullable: true, default: 7 })
  leadTimeDays: number | null;

  @ApiPropertyOptional({
    description: 'Horas de tiempo de producción',
    example: 24.5,
    default: 0,
  })
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    name: 'production_time_hours',
    nullable: true,
    default: 0,
  })
  productionTimeHours: number | null;

  @ApiPropertyOptional({
    description: 'Indica si requiere personalización obligatoria',
    default: false,
  })
  @Column({
    type: 'boolean',
    name: 'requires_customization',
    nullable: true,
    default: false,
  })
  requiresCustomization: boolean | null;

  @ApiPropertyOptional({
    description: 'Enlaces a marketplaces externos',
    example: { amazon: 'url', mercadolibre: 'url' },
  })
  @Column({ type: 'jsonb', name: 'marketplace_links', default: '{}' })
  marketplaceLinks: object;

  @ApiPropertyOptional({
    description: 'Embedding vectorial del producto (para búsquedas semánticas)',
    example: null,
  })
  @Column({ type: 'text', nullable: true })
  embedding: string | null;

  @ApiPropertyOptional({
    description: 'Estado de moderación del producto',
    enum: ModerationStatus,
    default: ModerationStatus.DRAFT,
  })
  @Column({
    type: 'text',
    name: 'moderation_status',
    nullable: true,
    default: 'draft',
  })
  moderationStatus: string | null;

  @ApiPropertyOptional({
    description: 'Indica si los datos de envío están completos',
    default: false,
  })
  @Column({
    type: 'boolean',
    name: 'shipping_data_complete',
    nullable: true,
    default: false,
  })
  shippingDataComplete: boolean | null;

  @ApiPropertyOptional({
    description: 'Indica si está listo para checkout',
    default: false,
  })
  @Column({
    type: 'boolean',
    name: 'ready_for_checkout',
    nullable: true,
    default: false,
  })
  readyForCheckout: boolean | null;

  @ApiPropertyOptional({
    description: 'Permite recolección local',
    default: false,
  })
  @Column({
    type: 'boolean',
    name: 'allows_local_pickup',
    nullable: true,
    default: false,
  })
  allowsLocalPickup: boolean | null;

  // Relación N:1 con ArtisanShop (muchos productos pertenecen a una tienda)
  @ApiProperty({ description: 'Tienda propietaria del producto' })
  @ManyToOne(() => ArtisanShop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: ArtisanShop;

  // Relación N:1 con ProductCategory (muchos productos pertenecen a una categoría)
  @ApiPropertyOptional({ description: 'Categoría del producto' })
  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory | null;
}
