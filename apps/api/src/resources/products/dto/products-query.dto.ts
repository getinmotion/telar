import {
  IsOptional,
  IsInt,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductsQueryDto {
  // Paginación
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El número de página debe ser un entero' })
  @Min(1, { message: 'La página debe ser al menos 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de productos por página',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  limit?: number = 20;

  // Filtros por categorías y características
  @ApiPropertyOptional({
    description: 'Categoría del producto',
    example: 'Cerámica',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Categorías (separadas por coma)',
    example: 'Cerámica,Textiles',
  })
  @IsOptional()
  @IsString()
  categories?: string;

  @ApiPropertyOptional({
    description: 'Tipos de artesanía (separados por coma)',
    example: 'Tejido,Bordado',
  })
  @IsOptional()
  @IsString()
  crafts?: string;

  @ApiPropertyOptional({
    description: 'Materiales (separados por coma)',
    example: 'Arcilla,Lana',
  })
  @IsOptional()
  @IsString()
  materials?: string;

  @ApiPropertyOptional({
    description: 'Técnicas (separadas por coma)',
    example: 'Torno,Telar',
  })
  @IsOptional()
  @IsString()
  techniques?: string;

  @ApiPropertyOptional({
    description: 'Slug de la tienda',
    example: 'artesanias-del-valle',
  })
  @IsOptional()
  @IsString()
  shopSlug?: string;

  @ApiPropertyOptional({
    description: 'Región de la tienda',
    example: 'Caribe',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Tipo de artesanía de la tienda',
    example: 'wayuu',
  })
  @IsOptional()
  @IsString()
  craftType?: string;

  @ApiPropertyOptional({
    description: 'IDs de productos (separados por coma)',
    example: '123e4567-e89b-12d3-a456-426614174000,223e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  ids?: string;

  // Rango de precio
  @ApiPropertyOptional({
    description: 'Precio mínimo',
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio mínimo debe ser un número' })
  @Min(0, { message: 'El precio mínimo debe ser mayor o igual a 0' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio máximo',
    example: 500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio máximo debe ser un número' })
  @Min(0, { message: 'El precio máximo debe ser mayor o igual a 0' })
  maxPrice?: number;

  // Rating (para futuro)
  @ApiPropertyOptional({
    description: 'Rating mínimo',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El rating mínimo debe ser un número' })
  @Min(0, { message: 'El rating mínimo debe ser 0 o mayor' })
  @Max(5, { message: 'El rating máximo es 5' })
  minRating?: number;

  // Booleanos
  @ApiPropertyOptional({
    description: 'Envío gratis',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'freeShipping debe ser un booleano' })
  freeShipping?: boolean;

  @ApiPropertyOptional({
    description: 'Productos destacados',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'featured debe ser un booleano' })
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Productos nuevos (últimos 30 días)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isNew debe ser un booleano' })
  isNew?: boolean;

  @ApiPropertyOptional({
    description: 'Puede comprarse (inventory > 0)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'canPurchase debe ser un booleano' })
  canPurchase?: boolean;

  // Búsqueda
  @ApiPropertyOptional({
    description: 'Búsqueda por texto (nombre, descripción, tags)',
    example: 'vasija',
  })
  @IsOptional()
  @IsString()
  q?: string;

  // Ordenamiento
  @ApiPropertyOptional({
    description: 'Ordenar por',
    enum: ['price', 'created_at', 'rating', 'name'],
    example: 'created_at',
  })
  @IsOptional()
  @IsEnum(['price', 'created_at', 'rating', 'name'], {
    message: 'sortBy debe ser: price, created_at, rating o name',
  })
  sortBy?: 'price' | 'created_at' | 'rating' | 'name';

  @ApiPropertyOptional({
    description: 'Orden',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'order debe ser: ASC o DESC',
  })
  order?: 'ASC' | 'DESC';

  // Exclusión
  @ApiPropertyOptional({
    description: 'ID de producto a excluir',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  exclude?: string;
}
