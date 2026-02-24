import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsUUID,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModerationStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID de la tienda propietaria',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El shopId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la tienda es obligatorio' })
  shopId: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Vasija de cerámica artesanal',
    maxLength: 255,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción completa del producto',
    example:
      'Hermosa vasija hecha a mano por artesanos locales con técnicas tradicionales...',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Descripción corta para listados',
    example: 'Vasija artesanal de cerámica con diseños tradicionales',
  })
  @IsOptional()
  @IsString({ message: 'La descripción corta debe ser una cadena de texto' })
  shortDescription?: string;

  @ApiProperty({
    description: 'Precio del producto en pesos colombianos',
    example: 45000,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (antes/regular)',
    example: 60000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio de comparación debe ser un número' })
  @Min(0, { message: 'El precio de comparación no puede ser negativo' })
  comparePrice?: number;

  @ApiPropertyOptional({
    description: 'URLs de imágenes del producto',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Subcategoría del producto',
    example: 'Decoración',
  })
  @IsOptional()
  @IsString({ message: 'La subcategoría debe ser una cadena de texto' })
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas del producto',
    example: ['artesanal', 'hecho a mano', 'tradicional'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser un array' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Cantidad en inventario',
    example: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El inventario debe ser un número' })
  @Min(0, { message: 'El inventario no puede ser negativo' })
  inventory?: number;

  @ApiPropertyOptional({
    description: 'SKU (código del producto)',
    example: 'CER-VAS-001',
  })
  @IsOptional()
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Peso en kilogramos',
    example: 1.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @Min(0, { message: 'El peso no puede ser negativo' })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto (alto, ancho, largo en cm)',
    example: { height: 20, width: 15, length: 15 },
  })
  @IsOptional()
  @IsObject({ message: 'Las dimensiones deben ser un objeto' })
  dimensions?: object;

  @ApiPropertyOptional({
    description: 'Materiales utilizados',
    example: ['Arcilla', 'Esmalte natural'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los materiales deben ser un array' })
  materials?: string[];

  @ApiPropertyOptional({
    description: 'Técnicas de elaboración',
    example: ['Torno', 'Quema a leña'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las técnicas deben ser un array' })
  techniques?: string[];

  @ApiPropertyOptional({
    description: 'Tiempo de producción estimado',
    example: '3-5 días',
  })
  @IsOptional()
  @IsString({ message: 'El tiempo de producción debe ser una cadena de texto' })
  productionTime?: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto es personalizable',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo customizable debe ser un booleano' })
  customizable?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo active debe ser un booleano' })
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto está destacado',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo featured debe ser un booleano' })
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto tiene NFT habilitado',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo nftEnabled debe ser un booleano' })
  nftEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Datos SEO del producto',
    example: { title: 'Vasija artesanal', metaDescription: '...' },
  })
  @IsOptional()
  @IsObject({ message: 'Los datos SEO deben ser un objeto' })
  seoData?: object;

  @ApiPropertyOptional({
    description: 'ID de categoría de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El categoryId debe ser un UUID válido' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Indica si se fabrica bajo pedido',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo madeToOrder debe ser un booleano' })
  madeToOrder?: boolean;

  @ApiPropertyOptional({
    description: 'Días de tiempo de entrega',
    example: 7,
  })
  @IsOptional()
  @IsNumber({}, { message: 'leadTimeDays debe ser un número' })
  @Min(0, { message: 'leadTimeDays no puede ser negativo' })
  leadTimeDays?: number;

  @ApiPropertyOptional({
    description: 'Horas de tiempo de producción',
    example: 24.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'productionTimeHours debe ser un número' })
  @Min(0, { message: 'productionTimeHours no puede ser negativo' })
  productionTimeHours?: number;

  @ApiPropertyOptional({
    description: 'Indica si requiere personalización obligatoria',
    default: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo requiresCustomization debe ser un booleano',
  })
  requiresCustomization?: boolean;

  @ApiPropertyOptional({
    description: 'Enlaces a marketplaces externos',
    example: { amazon: 'url', mercadolibre: 'url' },
  })
  @IsOptional()
  @IsObject({ message: 'Los enlaces de marketplace deben ser un objeto' })
  marketplaceLinks?: object;

  @ApiPropertyOptional({
    description: 'Estado de moderación del producto',
    enum: ModerationStatus,
    default: ModerationStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ModerationStatus, {
    message: 'El estado de moderación debe ser un valor válido',
  })
  moderationStatus?: ModerationStatus;

  @ApiPropertyOptional({
    description: 'Indica si los datos de envío están completos',
    default: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo shippingDataComplete debe ser un booleano',
  })
  shippingDataComplete?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si está listo para checkout',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo readyForCheckout debe ser un booleano' })
  readyForCheckout?: boolean;

  @ApiPropertyOptional({
    description: 'Permite recolección local',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo allowsLocalPickup debe ser un booleano' })
  allowsLocalPickup?: boolean;
}
