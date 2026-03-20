import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del producto' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class GenerateShopHeroSlideDto {
  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Artesanías Arhuacas',
  })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({
    description: 'Tipo de artesanía',
    example: 'Mochilas arhuacas',
  })
  @IsString()
  @IsNotEmpty()
  craftType: string;

  @ApiProperty({
    description: 'Descripción de la tienda',
    example: 'Tejidos ancestrales de la Sierra Nevada',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Colores de marca',
    type: [String],
    example: ['#8B4513', '#F5DEB3', '#2F4F4F'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandColors?: string[];

  @ApiPropertyOptional({
    description: 'Claim o frase de marca',
    example: 'Tejiendo la sabiduría ancestral',
  })
  @IsString()
  @IsOptional()
  brandClaim?: string;

  @ApiPropertyOptional({
    description: 'Número de slides a generar',
    example: 3,
    default: 1,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  count?: number;

  @ApiPropertyOptional({
    description: 'Lista de productos destacados',
    type: [ProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  @IsOptional()
  products?: ProductDto[];

  @ApiPropertyOptional({
    description: 'Contexto cultural detallado del artesano',
    example:
      'Artesana de la comunidad Arhuaca de la Sierra Nevada. Especializada en mochilas tejidas con técnica ancestral...',
  })
  @IsString()
  @IsOptional()
  culturalContext?: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  suggestedImage: string;
}

export interface GenerateShopHeroSlideResponse {
  slides: HeroSlide[];
}
