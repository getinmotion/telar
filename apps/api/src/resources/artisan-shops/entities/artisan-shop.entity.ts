import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { BrandTheme } from '../../brand-themes/entities/brand-theme.entity';
import { Product } from '../../products/entities/product.entity';
import { ImageUrlBuilder } from '../../../common/utils/image-url-builder.util';

// Enums
export enum PrivacyLevel {
  PUBLIC = 'public',
  LIMITED = 'limited',
  PRIVATE = 'private',
}

export enum CreationStatus {
  DRAFT = 'draft',
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
}

export enum PublishStatus {
  PENDING_PUBLISH = 'pending_publish',
  PUBLISHED = 'published',
}

export enum BankDataStatus {
  NOT_SET = 'not_set',
  COMPLETE = 'complete',
}

export enum MarketplaceApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'artisan_shops', schema: 'shop' })
export class ArtisanShop extends BaseEntity {
  @ApiProperty({ description: 'ID único de la tienda' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Artesanías del Valle',
  })
  @Column({ type: 'text', name: 'shop_name' })
  shopName: string;

  @ApiProperty({
    description: 'Slug único de la tienda (URL amigable)',
    example: 'artesanias-del-valle',
  })
  @Column({ type: 'text', name: 'shop_slug', unique: true })
  shopSlug: string;

  @ApiPropertyOptional({
    description: 'Descripción breve de la tienda',
    example: 'Tienda de artesanías tradicionales colombianas',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Historia de la tienda',
    example: 'Fundada en 2020 por artesanos locales...',
  })
  @Column({ type: 'text', nullable: true })
  story: string | null;

  @ApiPropertyOptional({
    description: 'URL del logo de la tienda',
    example: 'https://example.com/logo.png',
  })
  @Column({ type: 'text', name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({
    description: 'URL del banner de la tienda',
    example: 'https://example.com/banner.png',
  })
  @Column({ type: 'text', name: 'banner_url', nullable: true })
  bannerUrl: string | null;

  @ApiPropertyOptional({
    description: 'Tipo de artesanía',
    example: 'Cerámica',
  })
  @Column({ type: 'text', name: 'craft_type', nullable: true })
  craftType: string | null;

  @ApiPropertyOptional({
    description: 'Región de origen',
    example: 'Valle del Cauca',
  })
  @Column({ type: 'text', nullable: true })
  region: string | null;

  @ApiPropertyOptional({
    description: 'Certificaciones de la tienda',
    example: ['ISO 9001', 'Comercio Justo'],
  })
  @Column({ type: 'jsonb', default: '[]' })
  certifications: string[];

  @ApiPropertyOptional({
    description: 'Información de contacto',
    example: { email: 'info@tienda.com', phone: '+57 300 123 4567' },
  })
  @Column({ type: 'jsonb', name: 'contact_info', default: '{}' })
  contactInfo: object;

  @ApiPropertyOptional({
    description: 'Enlaces a redes sociales',
    example: { facebook: 'https://facebook.com/tienda', instagram: '@tienda' },
  })
  @Column({ type: 'jsonb', name: 'social_links', default: '{}' })
  socialLinks: object;

  @ApiProperty({
    description: 'Indica si la tienda está activa',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ApiProperty({
    description: 'Indica si la tienda está destacada',
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @ApiProperty({
    description: 'Indica si la tienda tiene cobertura de Servientrega',
    default: false,
  })
  @Column({ type: 'boolean', name: 'servientrega_coverage', default: false })
  servientregaCoverage: boolean;

  @ApiPropertyOptional({
    description: 'Datos SEO de la tienda',
    example: { title: 'Tienda', description: 'Descripción SEO' },
  })
  @Column({ type: 'jsonb', name: 'seo_data', default: '{}' })
  seoData: object;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Nivel de privacidad de la tienda',
    enum: PrivacyLevel,
    default: PrivacyLevel.PUBLIC,
  })
  @Column({
    type: 'text',
    name: 'privacy_level',
    nullable: true,
    default: 'public',
  })
  privacyLevel: string | null;

  @ApiPropertyOptional({
    description: 'Clasificación de datos de la tienda',
    example: {
      contact: 'sensitive',
      analytics: 'restricted',
      strategies: 'confidential',
    },
  })
  @Column({
    type: 'jsonb',
    name: 'data_classification',
    default:
      '{"contact": "sensitive", "analytics": "restricted", "strategies": "confidential"}',
  })
  dataClassification: object;

  @ApiPropertyOptional({
    description: 'Perfil público de la tienda',
  })
  @Column({ type: 'jsonb', name: 'public_profile', nullable: true })
  publicProfile: object | null;

  @ApiPropertyOptional({
    description: 'Estado de creación de la tienda',
    enum: CreationStatus,
    default: CreationStatus.COMPLETE,
  })
  @Column({
    type: 'text',
    name: 'creation_status',
    nullable: true,
    default: 'complete',
  })
  creationStatus: string | null;

  @ApiPropertyOptional({
    description: 'Paso actual de creación',
    default: 0,
  })
  @Column({ type: 'integer', name: 'creation_step', nullable: true, default: 0 })
  creationStep: number | null;

  @ApiPropertyOptional({
    description: 'Colores primarios de la marca',
    example: ['#007BFF', '#FFC107'],
  })
  @Column({ type: 'jsonb', name: 'primary_colors', default: '[]' })
  primaryColors: string[];

  @ApiPropertyOptional({
    description: 'Colores secundarios de la marca',
    example: ['#6C757D', '#28A745'],
  })
  @Column({ type: 'jsonb', name: 'secondary_colors', default: '[]' })
  secondaryColors: string[];

  @ApiPropertyOptional({
    description: 'Eslogan de la marca',
    example: 'Arte que trasciende',
  })
  @Column({ type: 'text', name: 'brand_claim', nullable: true })
  brandClaim: string | null;

  @ApiPropertyOptional({
    description: 'Configuración del hero/carousel',
    example: { slides: [], autoplay: true, duration: 5000 },
  })
  @Column({
    type: 'jsonb',
    name: 'hero_config',
    default: '{"slides": [], "autoplay": true, "duration": 5000}',
  })
  heroConfig: object;

  @ApiPropertyOptional({
    description: 'Contenido de la sección "Acerca de"',
    example: {
      story: '',
      title: '',
      values: [],
      vision: '',
      mission: '',
    },
  })
  @Column({
    type: 'jsonb',
    name: 'about_content',
    default: '{"story": "", "title": "", "values": [], "vision": "", "mission": ""}',
  })
  aboutContent: object;

  @ApiPropertyOptional({
    description: 'Configuración de contacto',
    example: {
      email: '',
      hours: '',
      phone: '',
      address: '',
      whatsapp: '',
      map_embed: '',
    },
  })
  @Column({
    type: 'jsonb',
    name: 'contact_config',
    default:
      '{"email": "", "hours": "", "phone": "", "address": "", "whatsapp": "", "map_embed": ""}',
  })
  contactConfig: object;

  @ApiPropertyOptional({
    description: 'ID del tema activo',
    example: 'theme-ocean-blue-2024',
  })
  @Column({ type: 'text', name: 'active_theme_id', nullable: true })
  activeThemeId: string | null;

  @ApiPropertyOptional({
    description: 'Estado de publicación',
    enum: PublishStatus,
    default: PublishStatus.PENDING_PUBLISH,
  })
  @Column({
    type: 'text',
    name: 'publish_status',
    nullable: true,
    default: 'pending_publish',
  })
  publishStatus: string | null;

  @ApiProperty({
    description: 'Indica si está aprobada para marketplace',
    default: false,
  })
  @Column({
    type: 'boolean',
    name: 'marketplace_approved',
    nullable: true,
    default: false,
  })
  marketplaceApproved: boolean | null;

  @ApiPropertyOptional({
    description: 'Fecha de aprobación en marketplace',
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'marketplace_approved_at',
    nullable: true,
  })
  marketplaceApprovedAt: Date | null;

  @ApiPropertyOptional({
    description: 'ID de quien aprobó en marketplace',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'marketplace_approved_by', nullable: true })
  marketplaceApprovedBy: string | null;

  @ApiPropertyOptional({
    description: 'ID de contraparte/proveedor de pagos',
    example: 'CONTRAPARTY123',
  })
  @Column({ type: 'text', name: 'id_contraparty', nullable: true })
  idContraparty: string | null;

  @ApiPropertyOptional({
    description: 'Perfil del artesano',
  })
  @Column({ type: 'jsonb', name: 'artisan_profile', nullable: true })
  artisanProfile: object | null;

  @ApiProperty({
    description: 'Indica si el perfil del artesano está completo',
    default: false,
  })
  @Column({
    type: 'boolean',
    name: 'artisan_profile_completed',
    nullable: true,
    default: false,
  })
  artisanProfileCompleted: boolean | null;

  @ApiPropertyOptional({
    description: 'Estado de los datos bancarios',
    enum: BankDataStatus,
    default: BankDataStatus.NOT_SET,
  })
  @Column({
    type: 'text',
    name: 'bank_data_status',
    nullable: true,
    default: 'not_set',
  })
  bankDataStatus: string | null;

  @ApiPropertyOptional({
    description: 'Estado de aprobación en marketplace',
    enum: MarketplaceApprovalStatus,
    default: MarketplaceApprovalStatus.PENDING,
  })
  @Column({
    type: 'text',
    name: 'marketplace_approval_status',
    nullable: true,
    default: 'pending',
  })
  marketplaceApprovalStatus: string | null;

  @ApiPropertyOptional({
    description: 'Departamento',
    example: 'Valle del Cauca',
  })
  @Column({ type: 'text', nullable: true })
  department: string | null;

  @ApiPropertyOptional({
    description: 'Municipio',
    example: 'Cali',
  })
  @Column({ type: 'text', nullable: true })
  municipality: string | null;

  // Relación 1:1 con User
  @ApiProperty({ description: 'Usuario propietario de la tienda' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación N:1 con BrandTheme (opcional)
  @ApiPropertyOptional({ description: 'Tema activo de la tienda' })
  @ManyToOne(() => BrandTheme, { nullable: true })
  @JoinColumn({ name: 'active_theme_id', referencedColumnName: 'themeId' })
  activeTheme: BrandTheme | null;

  // Relación 1:N con Product (una tienda tiene muchos productos)
  @ApiPropertyOptional({ description: 'Productos de la tienda' })
  @OneToMany(() => Product, (product) => product.shop)
  products!: Product[];

  /**
   * Transform relative image paths to full CDN URLs after loading from database
   * This runs automatically when TypeORM loads an entity
   */
  @AfterLoad()
  transformImageUrls() {
    this.logoUrl = ImageUrlBuilder.buildUrl(this.logoUrl);
    this.bannerUrl = ImageUrlBuilder.buildUrl(this.bannerUrl);
    this.heroConfig = ImageUrlBuilder.transformObject(this.heroConfig);
    this.artisanProfile = ImageUrlBuilder.transformObject(this.artisanProfile);
  }
}
