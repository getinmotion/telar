import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============= Enums =============

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_MODERATION = 'pending_moderation',
  CHANGES_REQUESTED = 'changes_requested',
  APPROVED = 'approved',
  APPROVED_WITH_EDITS = 'approved_with_edits',
  REJECTED = 'rejected',
}

export enum PieceType {
  FUNCIONAL = 'funcional',
  DECORATIVA = 'decorativa',
  MIXTA = 'mixta',
}

export enum StyleType {
  TRADICIONAL = 'tradicional',
  CONTEMPORANEO = 'contemporaneo',
  FUSION = 'fusion',
}

export enum ProcessType {
  MANUAL = 'manual',
  MIXTO = 'mixto',
  ASISTIDO = 'asistido',
}

export enum AvailabilityType {
  EN_STOCK = 'en_stock',
  BAJO_PEDIDO = 'bajo_pedido',
  EDICION_LIMITADA = 'edicion_limitada',
}

export enum FragilityLevel {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

// ============= Nested DTOs =============

export class CreateProductArtisanalIdentityDto {
  @IsOptional()
  @IsUUID()
  primaryCraftId?: string;

  @IsOptional()
  @IsUUID()
  primaryTechniqueId?: string;

  @IsOptional()
  @IsUUID()
  secondaryTechniqueId?: string;

  @IsOptional()
  @IsUUID()
  curatorialCategoryId?: string;

  @IsOptional()
  @IsEnum(PieceType)
  pieceType?: PieceType;

  @IsOptional()
  @IsEnum(StyleType)
  style?: StyleType;

  @IsOptional()
  @IsBoolean()
  isCollaboration?: boolean;

  @IsOptional()
  @IsEnum(ProcessType)
  processType?: ProcessType;

  @IsOptional()
  @IsString()
  estimatedElaborationTime?: string;
}

export class CreateProductPhysicalSpecsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  widthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthOrDiameterCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  realWeightKg?: number;
}

export class CreateProductLogisticsDto {
  @IsOptional()
  @IsString()
  packagingType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packHeightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packWidthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packLengthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packWeightKg?: number;

  @IsOptional()
  @IsEnum(FragilityLevel)
  fragility?: FragilityLevel;

  @IsOptional()
  @IsBoolean()
  requiresAssembly?: boolean;

  @IsOptional()
  @IsString()
  specialProtectionNotes?: string;
}

export class CreateProductProductionDto {
  @IsNotEmpty()
  @IsEnum(AvailabilityType)
  availabilityType!: AvailabilityType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  productionTimeDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyCapacity?: number;

  @IsOptional()
  @IsString()
  requirementsToStart?: string;
}

export class CreateProductMediaDto {
  @IsNotEmpty()
  @IsString()
  mediaUrl!: string;

  @IsNotEmpty()
  @IsEnum(MediaType)
  mediaType!: MediaType;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class CreateProductBadgeDto {
  @IsNotEmpty()
  @IsUUID()
  badgeId!: string;

  @IsOptional()
  @IsString()
  awardedBy?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  validUntil?: string;
}

export class CreateProductMaterialLinkDto {
  @IsNotEmpty()
  @IsUUID()
  materialId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  materialOrigin?: string;
}

export class CreateProductVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @IsNotEmpty()
  @IsString()
  basePriceMinor!: string; // BIGINT como string

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  realWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimHeightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimWidthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimLengthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packHeightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packWidthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packLengthCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packWeightKg?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============= Main DTO =============

export class CreateProductsNewDto {
  // ID del producto (opcional para crear, requerido para actualizar)
  @IsOptional()
  @IsUUID()
  productId?: string;

  // Core fields
  @IsNotEmpty()
  @IsUUID()
  storeId!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  legacyProductId?: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  shortDescription!: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsString()
  careNotes?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  // Nested entities (1:1 relationships)
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductArtisanalIdentityDto)
  artisanalIdentity?: CreateProductArtisanalIdentityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductPhysicalSpecsDto)
  physicalSpecs?: CreateProductPhysicalSpecsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductLogisticsDto)
  logistics?: CreateProductLogisticsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductProductionDto)
  production?: CreateProductProductionDto;

  // Nested arrays (1:N and N:M relationships)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMediaDto)
  media?: CreateProductMediaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductBadgeDto)
  badges?: CreateProductBadgeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMaterialLinkDto)
  materials?: CreateProductMaterialLinkDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}
