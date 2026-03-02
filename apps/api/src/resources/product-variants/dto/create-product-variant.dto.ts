import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
  IsEnum,
  IsObject,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VariantStatus,
  OptionValues,
  Dimensions,
} from '../entities/product-variant.entity';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'ID del producto al que pertenece la variante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'SKU único de la variante',
    example: 'PROD-001-RED-M',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({
    description: 'Valores de opciones de la variante (color, talla, etc.)',
    example: { color: 'rojo', talla: 'M' },
  })
  @IsOptional()
  @IsObject()
  optionValues?: OptionValues;

  @ApiPropertyOptional({
    description: 'Precio de venta',
    example: 25000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original antes de descuento)',
    example: 35000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    description: 'Costo de producción o adquisición',
    example: 15000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({
    description: 'Cantidad en stock',
    example: 100,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Stock mínimo antes de alertar',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStock?: number;

  @ApiPropertyOptional({
    description: 'Peso de la variante en kg',
    example: 0.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones de la variante',
    example: { length: 20, width: 15, height: 10, unit: 'cm' },
  })
  @IsOptional()
  @IsObject()
  dimensions?: Dimensions;

  @ApiPropertyOptional({
    description: 'Estado de la variante',
    enum: VariantStatus,
    default: VariantStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;
}
