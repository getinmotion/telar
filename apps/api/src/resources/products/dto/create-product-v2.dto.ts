import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Enums alineados con el nuevo schema (shop.products_core + tablas relacionadas)
 */
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

/**
 * Identidad artesanal del producto
 */
class ArtisanalIdentityDto {
  @ApiPropertyOptional({ description: 'Nombre del oficio artesanal' })
  @IsOptional()
  @IsString()
  craft?: string;

  @ApiPropertyOptional({ description: 'Técnica principal' })
  @IsOptional()
  @IsString()
  primaryTechnique?: string;

  @ApiPropertyOptional({ description: 'Técnica secundaria' })
  @IsOptional()
  @IsString()
  secondaryTechnique?: string;

  @ApiPropertyOptional({ enum: PieceType })
  @IsOptional()
  @IsEnum(PieceType)
  pieceType?: PieceType;

  @ApiPropertyOptional({ enum: StyleType })
  @IsOptional()
  @IsEnum(StyleType)
  style?: StyleType;

  @ApiPropertyOptional({ enum: ProcessType })
  @IsOptional()
  @IsEnum(ProcessType)
  processType?: ProcessType;

  @ApiPropertyOptional({ description: 'Tiempo estimado de elaboración' })
  @IsOptional()
  @IsString()
  estimatedElaborationTime?: string;

  @ApiPropertyOptional({ description: 'Es una colaboración entre talleres' })
  @IsOptional()
  @IsBoolean()
  isCollaboration?: boolean;
}

/**
 * Material con metadata
 */
class MaterialDto {
  @ApiProperty({ description: 'Nombre del material' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Es material principal' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Origen del material' })
  @IsOptional()
  @IsString()
  origin?: string;
}

/**
 * Especificaciones físicas
 */
class PhysicalSpecsDto {
  @ApiPropertyOptional({ description: 'Alto en cm' })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional({ description: 'Ancho en cm' })
  @IsOptional()
  @IsNumber()
  widthCm?: number;

  @ApiPropertyOptional({ description: 'Largo o diámetro en cm' })
  @IsOptional()
  @IsNumber()
  lengthOrDiameterCm?: number;

  @ApiPropertyOptional({ description: 'Peso real en kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  realWeightKg?: number;
}

/**
 * Datos de producción y disponibilidad
 */
class ProductionDto {
  @ApiProperty({ enum: AvailabilityType })
  @IsEnum(AvailabilityType)
  availabilityType: AvailabilityType;

  @ApiPropertyOptional({ description: 'Tiempo de producción en días' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  productionTimeDays?: number;

  @ApiPropertyOptional({ description: 'Capacidad mensual' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  monthlyCapacity?: number;

  @ApiPropertyOptional({ description: 'Requisitos para iniciar producción' })
  @IsOptional()
  @IsString()
  requirementsToStart?: string;
}

/**
 * Variante del producto
 */
class VariantDto {
  @ApiPropertyOptional({ description: 'SKU de la variante' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Precio base en centavos (minor units)' })
  @IsNumber()
  @Min(1)
  basePriceMinor: number;

  @ApiPropertyOptional({ description: 'Cantidad en stock', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Atributos de la variante (ej: {color: "Azul", talla: "M"})',
  })
  @IsOptional()
  attributes?: Record<string, string>;
}

/**
 * DTO provisional para creación de producto v2.
 *
 * Acepta datos estructurados según el nuevo schema (products_core + EAV)
 * pero internamente se mapea a la tabla shop.products existente.
 * Esto permite construir el flujo frontend correcto desde el inicio
 * y luego migrar el backend sin cambiar el contrato.
 */
export class CreateProductV2Dto {
  // ── Core ──────────────────────────────────────────────
  @ApiProperty({ description: 'ID de la tienda propietaria' })
  @IsUUID('4')
  @IsNotEmpty()
  shopId: string;

  @ApiProperty({ description: 'Nombre del producto', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Descripción corta para listados' })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiPropertyOptional({ description: 'Historia / narrativa de la pieza' })
  @IsOptional()
  @IsString()
  history?: string;

  @ApiPropertyOptional({ description: 'Notas de cuidado' })
  @IsOptional()
  @IsString()
  careNotes?: string;

  @ApiPropertyOptional({ description: 'ID de la categoría de producto' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  // ── Identidad Artesanal ───────────────────────────────
  @ApiPropertyOptional({ description: 'Identidad artesanal del producto' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ArtisanalIdentityDto)
  artisanalIdentity?: ArtisanalIdentityDto;

  // ── Materiales ────────────────────────────────────────
  @ApiPropertyOptional({
    description: 'Materiales utilizados',
    type: [MaterialDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialDto)
  materials?: MaterialDto[];

  // ── Especificaciones Físicas ──────────────────────────
  @ApiPropertyOptional({ description: 'Especificaciones físicas' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhysicalSpecsDto)
  physicalSpecs?: PhysicalSpecsDto;

  // ── Producción ────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Datos de producción y disponibilidad' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductionDto)
  production?: ProductionDto;

  // ── Variantes / Precio ────────────────────────────────
  @ApiPropertyOptional({
    description:
      'Variantes del producto. Si no se envían, se crea una variante default.',
    type: [VariantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  /**
   * Precio simple (se usa si no se envían variantes).
   * En pesos colombianos.
   */
  @ApiPropertyOptional({
    description: 'Precio en COP (usado si no hay variantes)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  // ── Imágenes ──────────────────────────────────────────
  @ApiPropertyOptional({
    description: 'URLs de imágenes del producto',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  // ── Tags ──────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Etiquetas', type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  // ── Care Tags ───────────────────────────────────────
  @ApiPropertyOptional({
    description: 'Nombres de care tags seleccionados',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  careTags?: { name: string; isFromCatalog: boolean }[];

  // ── Propuestas de Taxonomía ─────────────────────────
  @ApiPropertyOptional({
    description: 'Propuestas de nuevos valores de catálogo (craft, technique, material) para aprobación curatorial',
  })
  @IsOptional()
  @IsArray()
  taxonomyProposals?: { type: string; name: string; description?: string }[];

  // ── Solicitud Curatorial ────────────────────────────
  @ApiPropertyOptional({
    description: 'Solicitud de categoría curatorial y badges de certificación',
  })
  @IsOptional()
  curatorialRequest?: {
    categoryName?: string;
    badgeCodes: string[];
    notes?: string;
  };
}
