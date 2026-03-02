import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VariantStatus } from '../entities/product-variant.entity';

export class QueryProductVariantDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la variante',
    enum: VariantStatus,
  })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;

  @ApiPropertyOptional({
    description: 'Buscar por SKU (parcial)',
    example: 'PROD-001',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Página actual',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo para ordenar',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección de orden (ASC o DESC)',
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
