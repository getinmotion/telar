import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus, MediaType } from './create-products-new.dto';

/**
 * DTO para el Step 1 del formulario de creación de productos
 * Campos obligatorios: ProductCore + ProductMedia
 */

export class CreateProductMediaStep1Dto {
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

export class CreateProductStep1Dto {
  // ProductCore - Campos obligatorios del Step 1
  @IsNotEmpty()
  @IsUUID()
  storeId!: string;

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
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  // ProductMedia - Array obligatorio con al menos una imagen
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMediaStep1Dto)
  media!: CreateProductMediaStep1Dto[];
}
