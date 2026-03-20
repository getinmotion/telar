import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt } from 'class-validator';

export class GenerateHeroImageDto {
  @ApiProperty({
    description: 'Título del slide',
    example: 'Mochilas Arhuacas de la Sierra Nevada',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Subtítulo del slide',
    example: 'Tejidas a mano por artesanas de la comunidad Arhuaca',
  })
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiProperty({
    description: 'Nombre de la tienda',
    example: 'Artesanías Wayuu',
  })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({
    description: 'Tipo de artesanía',
    example: 'Tejido tradicional',
  })
  @IsString()
  @IsNotEmpty()
  craftType: string;

  @ApiPropertyOptional({
    description: 'Colores de marca (hex)',
    example: ['#8B4513', '#F5DEB3', '#2F4F2F'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandColors?: string[];

  @ApiPropertyOptional({
    description: 'Claim o frase de marca',
    example: 'Tejiendo el alma de la Sierra',
  })
  @IsString()
  @IsOptional()
  brandClaim?: string;

  @ApiPropertyOptional({
    description: 'Índice del slide (para tracking)',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  slideIndex?: number;

  @ApiPropertyOptional({
    description: 'Texto de referencia adicional del usuario para guiar la generación',
    example: 'Mostrar mochilas colgadas en un ambiente natural',
  })
  @IsString()
  @IsOptional()
  referenceText?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen de referencia (solo descriptivo, DALL-E no acepta imágenes como input)',
    example: 'https://example.com/reference.jpg',
  })
  @IsString()
  @IsOptional()
  referenceImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Contexto cultural específico para asegurar precisión cultural en la imagen generada',
    example:
      'Comunidad Arhuaca de la Sierra Nevada. Técnicas ancestrales de tejido con simbolismos geométricos propios de la cosmología Arhuaca.',
  })
  @IsString()
  @IsOptional()
  culturalContext?: string;

  @ApiPropertyOptional({
    description:
      'URLs de imágenes de productos reales (solo descriptivo en el prompt, DALL-E 3 no acepta imágenes como input)',
    example: ['https://example.com/product1.jpg', 'https://example.com/product2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productImageUrls?: string[];
}

export interface GenerateHeroImageResponse {
  imageBase64: string;
  slideIndex: number;
}
