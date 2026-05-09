import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Carpetas permitidas para organizar archivos en S3
 */
export enum UploadFolder {
  PRODUCTS = 'products',
  SHOPS = 'shops',
  PROFILES = 'profiles',
  BRANDS = 'brands',
  CATEGORIES = 'categories',
  HERO = 'hero',
  CMS = 'cms',
  OTHER = 'other',
}

export class CreateFileUploadDto {
  @ApiProperty({
    description: 'Carpeta destino en S3',
    enum: UploadFolder,
    example: UploadFolder.PRODUCTS,
  })
  @IsEnum(UploadFolder)
  @IsNotEmpty()
  folder: UploadFolder;

  @ApiPropertyOptional({
    description: 'Descripción opcional del archivo',
    example: 'Logo de la tienda artesanal',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo a subir (imagen)',
  })
  file?: Express.Multer.File;
}
