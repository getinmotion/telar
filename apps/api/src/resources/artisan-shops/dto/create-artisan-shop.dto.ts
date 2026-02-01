import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsUUID,
  IsArray,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PrivacyLevel,
  CreationStatus,
  PublishStatus,
  BankDataStatus,
  MarketplaceApprovalStatus,
} from '../entities/artisan-shop.entity';

export class CreateArtisanShopDto {
  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Artesanías del Valle',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la tienda es obligatorio' })
  @MinLength(3, {
    message: 'El nombre de la tienda debe tener al menos 3 caracteres',
  })
  @MaxLength(200, {
    message: 'El nombre de la tienda no puede exceder 200 caracteres',
  })
  shopName: string;

  @ApiProperty({
    description:
      'Slug único de la tienda (URL amigable, solo letras minúsculas, números y guiones)',
    example: 'artesanias-del-valle',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El slug no puede exceder 100 caracteres' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug debe contener solo letras minúsculas, números y guiones (sin espacios)',
  })
  shopSlug: string;

  @ApiPropertyOptional({
    description: 'Descripción breve de la tienda',
    example: 'Tienda de artesanías tradicionales colombianas',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Historia de la tienda',
    example: 'Fundada en 2020 por artesanos locales...',
  })
  @IsOptional()
  @IsString({ message: 'La historia debe ser una cadena de texto' })
  story?: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la tienda',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString({ message: 'La URL del logo debe ser una cadena de texto' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL del banner de la tienda',
    example: 'https://example.com/banner.png',
  })
  @IsOptional()
  @IsString({ message: 'La URL del banner debe ser una cadena de texto' })
  bannerUrl?: string;

  @ApiPropertyOptional({
    description: 'Tipo de artesanía',
    example: 'Cerámica',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de artesanía debe ser una cadena de texto' })
  craftType?: string;

  @ApiPropertyOptional({
    description: 'Región de origen',
    example: 'Valle del Cauca',
  })
  @IsOptional()
  @IsString({ message: 'La región debe ser una cadena de texto' })
  region?: string;

  @ApiPropertyOptional({
    description: 'Certificaciones de la tienda',
    example: ['ISO 9001', 'Comercio Justo'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las certificaciones deben ser un arreglo' })
  certifications?: string[];

  @ApiPropertyOptional({
    description: 'Información de contacto',
    example: { email: 'info@tienda.com', phone: '+57 300 123 4567' },
  })
  @IsOptional()
  @IsObject({ message: 'La información de contacto debe ser un objeto' })
  contactInfo?: object;

  @ApiPropertyOptional({
    description: 'Enlaces a redes sociales',
    example: { facebook: 'https://facebook.com/tienda', instagram: '@tienda' },
  })
  @IsOptional()
  @IsObject({ message: 'Los enlaces sociales deben ser un objeto' })
  socialLinks?: object;

  @ApiPropertyOptional({
    description: 'Indica si la tienda está activa',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'active debe ser un valor booleano' })
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si la tienda está destacada',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'featured debe ser un valor booleano' })
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Datos SEO de la tienda',
    example: { title: 'Tienda', description: 'Descripción SEO' },
  })
  @IsOptional()
  @IsObject({ message: 'Los datos SEO deben ser un objeto' })
  seoData?: object;

  @ApiPropertyOptional({
    description: 'Nivel de privacidad de la tienda',
    enum: PrivacyLevel,
    default: PrivacyLevel.PUBLIC,
  })
  @IsOptional()
  @IsEnum(PrivacyLevel, {
    message: 'El nivel de privacidad debe ser: public, limited o private',
  })
  privacyLevel?: string;

  @ApiPropertyOptional({
    description: 'Clasificación de datos de la tienda',
    example: {
      contact: 'sensitive',
      analytics: 'restricted',
      strategies: 'confidential',
    },
  })
  @IsOptional()
  @IsObject({ message: 'La clasificación de datos debe ser un objeto' })
  dataClassification?: object;

  @ApiPropertyOptional({
    description: 'Estado de creación de la tienda',
    enum: CreationStatus,
    default: CreationStatus.COMPLETE,
  })
  @IsOptional()
  @IsEnum(CreationStatus, {
    message: 'El estado de creación debe ser: draft, incomplete o complete',
  })
  creationStatus?: string;

  @ApiPropertyOptional({
    description: 'Paso actual de creación',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El paso de creación debe ser un número' })
  creationStep?: number;

  @ApiPropertyOptional({
    description: 'Colores primarios de la marca',
    example: ['#007BFF', '#FFC107'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los colores primarios deben ser un arreglo' })
  primaryColors?: string[];

  @ApiPropertyOptional({
    description: 'Colores secundarios de la marca',
    example: ['#6C757D', '#28A745'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los colores secundarios deben ser un arreglo' })
  secondaryColors?: string[];

  @ApiPropertyOptional({
    description: 'Eslogan de la marca',
    example: 'Arte que trasciende',
  })
  @IsOptional()
  @IsString({ message: 'El eslogan debe ser una cadena de texto' })
  brandClaim?: string;

  @ApiPropertyOptional({
    description: 'Configuración del hero/carousel',
    example: { slides: [], autoplay: true, duration: 5000 },
  })
  @IsOptional()
  @IsObject({ message: 'La configuración del hero debe ser un objeto' })
  heroConfig?: object;

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
  @IsOptional()
  @IsObject({ message: 'El contenido "Acerca de" debe ser un objeto' })
  aboutContent?: object;

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
  @IsOptional()
  @IsObject({ message: 'La configuración de contacto debe ser un objeto' })
  contactConfig?: object;

  @ApiPropertyOptional({
    description: 'ID del tema activo',
    example: 'theme-ocean-blue-2024',
  })
  @IsOptional()
  @IsString({ message: 'El ID del tema debe ser una cadena de texto' })
  activeThemeId?: string;

  @ApiPropertyOptional({
    description: 'Estado de publicación',
    enum: PublishStatus,
    default: PublishStatus.PENDING_PUBLISH,
  })
  @IsOptional()
  @IsEnum(PublishStatus, {
    message:
      'El estado de publicación debe ser: pending_publish o published',
  })
  publishStatus?: string;

  @ApiPropertyOptional({
    description: 'ID de contraparte/proveedor de pagos',
    example: 'CONTRAPARTY123',
  })
  @IsOptional()
  @IsString({ message: 'El ID de contraparte debe ser una cadena de texto' })
  idContraparty?: string;

  @ApiPropertyOptional({
    description: 'Perfil del artesano',
  })
  @IsOptional()
  @IsObject({ message: 'El perfil del artesano debe ser un objeto' })
  artisanProfile?: object;

  @ApiPropertyOptional({
    description: 'Estado de los datos bancarios',
    enum: BankDataStatus,
    default: BankDataStatus.NOT_SET,
  })
  @IsOptional()
  @IsEnum(BankDataStatus, {
    message: 'El estado de datos bancarios debe ser: not_set, pending o approved',
  })
  bankDataStatus?: string;

  @ApiPropertyOptional({
    description: 'Estado de aprobación en marketplace',
    enum: MarketplaceApprovalStatus,
    default: MarketplaceApprovalStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(MarketplaceApprovalStatus, {
    message:
      'El estado de aprobación debe ser: pending, approved o rejected',
  })
  marketplaceApprovalStatus?: string;

  @ApiPropertyOptional({
    description: 'Departamento',
    example: 'Valle del Cauca',
  })
  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  department?: string;

  @ApiPropertyOptional({
    description: 'Municipio',
    example: 'Cali',
  })
  @IsOptional()
  @IsString({ message: 'El municipio debe ser una cadena de texto' })
  municipality?: string;
}
