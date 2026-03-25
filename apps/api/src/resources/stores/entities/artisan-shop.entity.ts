import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * LEGACY TABLE - public.artisan_shops
 * Tabla antigua que contiene todos los datos históricos de tiendas
 * Se accede mediante store.legacy_id
 */
@Entity({ schema: 'shop', name: 'artisan_shops' })
export class ArtisanShop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'shop_name', type: 'text' })
  shopName: string;

  @Column({ name: 'shop_slug', type: 'text', unique: true })
  shopSlug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  story: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'banner_url', type: 'text', nullable: true })
  bannerUrl: string;

  @Column({ name: 'craft_type', type: 'text', nullable: true })
  craftType: string;

  @Column({ type: 'text', nullable: true })
  region: string;

  @Column({ type: 'jsonb', default: [] })
  certifications: any[];

  @Column({ name: 'contact_info', type: 'jsonb', default: {} })
  contactInfo: Record<string, any>;

  @Column({ name: 'social_links', type: 'jsonb', default: {} })
  socialLinks: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ name: 'seo_data', type: 'jsonb', default: {} })
  seoData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'privacy_level', type: 'text', default: 'public' })
  privacyLevel: string;

  @Column({ name: 'data_classification', type: 'jsonb', default: {} })
  dataClassification: Record<string, any>;

  @Column({ name: 'public_profile', type: 'jsonb', nullable: true })
  publicProfile: Record<string, any>;

  @Column({ name: 'creation_status', type: 'text', default: 'complete' })
  creationStatus: string;

  @Column({ name: 'creation_step', type: 'int', default: 0 })
  creationStep: number;

  @Column({ name: 'primary_colors', type: 'jsonb', default: [] })
  primaryColors: any[];

  @Column({ name: 'secondary_colors', type: 'jsonb', default: [] })
  secondaryColors: any[];

  @Column({ name: 'brand_claim', type: 'text', nullable: true })
  brandClaim: string;

  @Column({ name: 'hero_config', type: 'jsonb', default: {} })
  heroConfig: Record<string, any>;

  @Column({ name: 'about_content', type: 'jsonb', default: {} })
  aboutContent: Record<string, any>;

  @Column({ name: 'contact_config', type: 'jsonb', default: {} })
  contactConfig: Record<string, any>;

  @Column({ name: 'active_theme_id', type: 'text', nullable: true })
  activeThemeId: string;

  @Column({ name: 'publish_status', type: 'text', default: 'pending_publish' })
  publishStatus: string;

  @Column({ name: 'marketplace_approved', type: 'boolean', default: false })
  marketplaceApproved: boolean;

  @Column({
    name: 'marketplace_approved_at',
    type: 'timestamptz',
    nullable: true,
  })
  marketplaceApprovedAt: Date;

  @Column({ name: 'marketplace_approved_by', type: 'uuid', nullable: true })
  marketplaceApprovedBy: string;

  @Column({ name: 'id_contraparty', type: 'text', nullable: true })
  idContraparty: string;

  @Column({ name: 'artisan_profile', type: 'jsonb', nullable: true })
  artisanProfile: Record<string, any>;

  @Column({
    name: 'artisan_profile_completed',
    type: 'boolean',
    default: false,
  })
  artisanProfileCompleted: boolean;

  @Column({ name: 'bank_data_status', type: 'text', default: 'not_set' })
  bankDataStatus: string;

  @Column({
    name: 'marketplace_approval_status',
    type: 'text',
    default: 'pending',
  })
  marketplaceApprovalStatus: string;

  @Column({ type: 'text', nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  municipality: string;
}
