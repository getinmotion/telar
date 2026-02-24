import {
  IsOptional,
  IsInt,
  IsString,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ArtisanShopsQueryDto {
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
    description: 'Cantidad de tiendas por página',
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

  // Booleanos
  @ApiPropertyOptional({
    description: 'Tiendas activas',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'active debe ser un booleano' })
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de publicación',
    enum: ['draft', 'published', 'archived'],
    example: 'published',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'publishStatus debe ser: draft, published o archived',
  })
  publishStatus?: 'draft' | 'published' | 'archived';

  @ApiPropertyOptional({
    description: 'Tiendas aprobadas en marketplace',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'marketplaceApproved debe ser un booleano' })
  marketplaceApproved?: boolean;

  @ApiPropertyOptional({
    description: 'Tiendas destacadas',
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
    description: 'Solo tiendas con productos aprobados',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'hasApprovedProducts debe ser un booleano' })
  hasApprovedProducts?: boolean;

  // Filtros de texto
  @ApiPropertyOptional({
    description: 'Slug de la tienda',
    example: 'artesanias-del-valle',
  })
  @IsOptional()
  @IsString()
  shopSlug?: string;

  @ApiPropertyOptional({
    description: 'Región',
    example: 'Valle del Cauca',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Tipo de artesanía',
    example: 'Cerámica',
  })
  @IsOptional()
  @IsString()
  craftType?: string;

  // Ordenamiento
  @ApiPropertyOptional({
    description: 'Ordenar por',
    enum: ['created_at', 'shop_name'],
    example: 'created_at',
  })
  @IsOptional()
  @IsEnum(['created_at', 'shop_name'], {
    message: 'sortBy debe ser: created_at o shop_name',
  })
  sortBy?: 'created_at' | 'shop_name';

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
}
