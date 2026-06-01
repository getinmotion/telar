import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/resources/users/entities/user.entity';
import { Country } from 'src/resources/countries/entities/country.entity';
import { Agreement } from 'src/resources/agreements/entities/agreement.entity';
import { ArtisanOrigin } from 'src/resources/artisan-origin/entities/artisan-origin.entity';
import { ArtisanIdentity } from 'src/resources/artisan-identity/entities/artisan-identity.entity';
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

export enum IdType {
  CC = 'cc',
  NIT = 'nit',
  CE = 'ce',
  PA = 'pa',
}

export enum Gender {
  M = 'M',
  F = 'F',
  SE = 'SE',
}

@Entity({ name: 'artisan_profile', schema: 'artesanos' })
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
    description: 'Código del tipo de identificación (CC, DNI, TI, etc.)',
    example: 'CC',
  })
  @Column({ type: 'varchar', length: 4, nullable: true, name: 'id_type' })
  idType!: string | null;

  @ApiPropertyOptional({
    description: 'Número de identificación',
    example: '1234567890',
  })
  @Column({ type: 'text', nullable: true, name: 'id_number' })
  idNumber: string | null;

  @ApiPropertyOptional({
    description: 'Género',
    enum: Gender,
    example: Gender.M,
  })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    name: 'gender',
  })
  gender: Gender | null;

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

  @ApiPropertyOptional({ description: 'ID del país' })
  @Column({ type: 'uuid', nullable: true, name: 'country_id' })
  countryId: string | null;

  @ApiPropertyOptional({ description: 'Relación con el país' })
  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'country_id' })
  country: Country | null;

  @ApiPropertyOptional({ description: 'ID del acuerdo' })
  @Column({ type: 'uuid', nullable: true, name: 'agreement_id' })
  agreementId: string | null;

  @ApiPropertyOptional({ description: 'Relación con el acuerdo' })
  @ManyToOne(() => Agreement, { nullable: true })
  @JoinColumn({ name: 'agreement_id' })
  agreement: Agreement | null;

  @ApiPropertyOptional({ description: 'ID del origen artesanal' })
  @Column({ type: 'uuid', nullable: true, name: 'artisan_origin_id' })
  artisanOriginId: string | null;

  @ApiPropertyOptional({ description: 'Relación con el origen artesanal' })
  @ManyToOne(() => ArtisanOrigin, { nullable: true })
  @JoinColumn({ name: 'artisan_origin_id' })
  artisanOrigin: ArtisanOrigin | null;

  @ApiPropertyOptional({ description: 'ID de la identidad artesanal (técnica, diferenciador)' })
  @Column({ type: 'uuid', nullable: true, name: 'artisan_identity_id' })
  artisanIdentityId: string | null;

  @ApiPropertyOptional({ description: 'Relación con la identidad artesanal' })
  @ManyToOne(() => ArtisanIdentity, { nullable: true })
  @JoinColumn({ name: 'artisan_identity_id' })
  artisanIdentity: ArtisanIdentity | null;

  /**
   * Transform relative image paths to full CDN URLs after loading from database
   */
  @AfterLoad()
  transformImageUrls() {
    this.avatarUrl = ImageUrlBuilder.buildUrl(this.avatarUrl);
  }
}
