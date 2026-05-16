import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { MarketplaceKey } from '../../marketplace-assignments/entities/marketplace-assignment.entity';

export class CreateFeaturedCollectionDto {
  @ApiProperty({ description: 'Título editorial' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Descripción editorial' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['premium', 'regional', 'sponsor', 'hotel', 'design'] })
  @IsString()
  @IsIn(['premium', 'regional', 'sponsor', 'hotel', 'design'])
  marketplaceKey!: MarketplaceKey;

  @ApiPropertyOptional({ description: 'IDs de productos ordenados editorialmente', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({ description: 'Si la colección está activa' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'ID del curador' })
  @IsUUID()
  @IsOptional()
  curatedBy?: string;
}

export class UpdateFeaturedCollectionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
