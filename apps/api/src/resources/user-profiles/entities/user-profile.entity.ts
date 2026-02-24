import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/resources/users/entities/user.entity';
import { ImageUrlBuilder } from '../../../common/utils/image-url-builder.util';

export enum UserType {
  REGULAR = 'regular',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum AccountType {
  BUYER = 'buyer',
  SELLER = 'seller',
  BOTH = 'both',
}

@Entity({ name: 'user_profiles', schema: 'artesanos' })
export class UserProfile extends BaseEntity {
  @ApiProperty({ description: 'ID único del perfil de usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario (relación 1 a 1 con auth.users)',
  })
  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Relación con el usuario' })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiPropertyOptional({ description: 'Nombre completo del usuario' })
  @Column({ type: 'text', nullable: true, name: 'full_name' })
  fullName: string | null;

  @ApiPropertyOptional({ description: 'URL del avatar del usuario' })
  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @ApiProperty({ description: 'Fecha de creación del perfil' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del perfil' })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Descripción del negocio' })
  @Column({ type: 'text', nullable: true, name: 'business_description' })
  businessDescription: string | null;

  @ApiPropertyOptional({ description: 'Nombre de la marca' })
  @Column({ type: 'text', nullable: true, name: 'brand_name' })
  brandName: string | null;

  @ApiPropertyOptional({ description: 'Tipo de negocio' })
  @Column({ type: 'text', nullable: true, name: 'business_type' })
  businessType: string | null;

  @ApiPropertyOptional({ description: 'Mercado objetivo' })
  @Column({ type: 'text', nullable: true, name: 'target_market' })
  targetMarket: string | null;

  @ApiPropertyOptional({ description: 'Etapa actual del negocio' })
  @Column({ type: 'text', nullable: true, name: 'current_stage' })
  currentStage: string | null;

  @ApiPropertyOptional({
    description: 'Objetivos del negocio',
    type: [String],
  })
  @Column({ type: 'text', array: true, nullable: true, name: 'business_goals' })
  businessGoals: string[] | null;

  @ApiPropertyOptional({ description: 'Meta de ingresos mensuales' })
  @Column({ type: 'integer', nullable: true, name: 'monthly_revenue_goal' })
  monthlyRevenueGoal: number | null;

  @ApiPropertyOptional({ description: 'Disponibilidad de tiempo' })
  @Column({ type: 'text', nullable: true, name: 'time_availability' })
  timeAvailability: string | null;

  @ApiPropertyOptional({ description: 'Tamaño del equipo' })
  @Column({ type: 'text', nullable: true, name: 'team_size' })
  teamSize: string | null;

  @ApiPropertyOptional({
    description: 'Desafíos actuales del negocio',
    type: [String],
  })
  @Column({
    type: 'text',
    array: true,
    nullable: true,
    name: 'current_challenges',
  })
  currentChallenges: string[] | null;

  @ApiPropertyOptional({
    description: 'Canales de venta',
    type: [String],
  })
  @Column({ type: 'text', array: true, nullable: true, name: 'sales_channels' })
  salesChannels: string[] | null;

  @ApiPropertyOptional({
    description: 'Presencia en redes sociales (JSON)',
    example: { instagram: '@usuario', facebook: 'usuario' },
  })
  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
    name: 'social_media_presence',
  })
  socialMediaPresence: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Ubicación del negocio' })
  @Column({ type: 'text', nullable: true, name: 'business_location' })
  businessLocation: string | null;

  @ApiPropertyOptional({ description: 'Años en el negocio' })
  @Column({ type: 'integer', nullable: true, name: 'years_in_business' })
  yearsInBusiness: number | null;

  @ApiPropertyOptional({ description: 'Rango de inversión inicial' })
  @Column({
    type: 'text',
    nullable: true,
    name: 'initial_investment_range',
  })
  initialInvestmentRange: string | null;

  @ApiPropertyOptional({
    description: 'Habilidades principales',
    type: [String],
  })
  @Column({ type: 'text', array: true, nullable: true, name: 'primary_skills' })
  primarySkills: string[] | null;

  @ApiProperty({
    description: 'Preferencia de idioma',
    default: 'es',
    example: 'es',
  })
  @Column({
    type: 'text',
    nullable: true,
    default: 'es',
    name: 'language_preference',
  })
  languagePreference: string | null;

  @ApiProperty({
    description: 'Tipo de usuario',
    enum: UserType,
    default: UserType.REGULAR,
  })
  @Column({
    type: 'enum',
    enum: UserType,
    nullable: true,
    default: UserType.REGULAR,
    name: 'user_type',
  })
  userType: UserType | null;

  @ApiPropertyOptional({ description: 'Primer nombre' })
  @Column({ type: 'text', nullable: true, name: 'first_name' })
  firstName: string | null;

  @ApiPropertyOptional({ description: 'Apellido' })
  @Column({ type: 'text', nullable: true, name: 'last_name' })
  lastName: string | null;

  @ApiPropertyOptional({
    description: 'Número de WhatsApp en formato E.164',
    example: '+573001234567',
  })
  @Column({ type: 'text', nullable: true, name: 'whatsapp_e164' })
  whatsappE164: string | null;

  @ApiPropertyOptional({ description: 'Departamento' })
  @Column({ type: 'text', nullable: true })
  department: string | null;

  @ApiPropertyOptional({ description: 'Ciudad' })
  @Column({ type: 'text', nullable: true })
  city: string | null;

  @ApiPropertyOptional({ description: 'RUT (Registro Único Tributario)' })
  @Column({ type: 'text', nullable: true })
  rut: string | null;

  @ApiProperty({
    description: 'Indica si el RUT está pendiente',
    default: false,
  })
  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'rut_pendiente',
  })
  rutPendiente: boolean | null;

  @ApiProperty({
    description: 'Opción de suscripción a newsletter',
    default: false,
  })
  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'newsletter_opt_in',
  })
  newsletterOptIn: boolean | null;

  @ApiProperty({
    description: 'Tipo de cuenta',
    enum: AccountType,
    default: AccountType.BUYER,
  })
  @Column({
    type: 'enum',
    enum: AccountType,
    nullable: true,
    default: AccountType.BUYER,
    name: 'account_type',
  })
  accountType: AccountType | null;

  @ApiPropertyOptional({ description: 'Código DANE de la ciudad' })
  @Column({ type: 'integer', nullable: true, name: 'dane_city' })
  daneCity: number | null;

  /**
   * Transform relative image paths to full CDN URLs after loading from database
   */
  @AfterLoad()
  transformImageUrls() {
    this.avatarUrl = ImageUrlBuilder.buildUrl(this.avatarUrl);
  }
}
