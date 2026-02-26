import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BrandAiAction {
  GENERATE_CLAIM = 'generate_claim',
  EXTRACT_COLORS = 'extract_colors',
  GENERATE_COLOR_PALETTE = 'generate_color_palette',
  DIAGNOSE_BRAND_IDENTITY = 'diagnose_brand_identity',
}

export class BrandPerceptionDto {
  @ApiPropertyOptional({ description: 'Años con la marca', example: '2 años' })
  @IsOptional()
  @IsString()
  yearsWithBrand?: string;

  @ApiPropertyOptional({
    description: 'Descripción en 3 palabras',
    example: 'artesanal, cálido, único',
  })
  @IsOptional()
  @IsString()
  descriptionIn3Words?: string;

  @ApiPropertyOptional({
    description: 'Feedback de clientes',
    example: 'Les encanta la calidad y el detalle',
  })
  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @ApiPropertyOptional({
    description: 'Qué transmite el logo',
    example: 'Tradición y calidez',
  })
  @IsOptional()
  @IsString()
  logoFeeling?: string;

  @ApiPropertyOptional({
    description: 'Público objetivo',
    example: 'Mujeres 25-45 años interesadas en artesanías',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Emoción deseada al ver la marca',
    example: 'Confianza y orgullo por lo artesanal',
  })
  @IsOptional()
  @IsString()
  desiredEmotion?: string;
}

export class BrandColorsDto {
  @ApiPropertyOptional({
    description: 'Colores primarios en formato hex',
    type: [String],
    example: ['#FF5733', '#C70039'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primary?: string[];

  @ApiPropertyOptional({
    description: 'Colores secundarios en formato hex',
    type: [String],
    example: ['#FFC300', '#DAF7A6'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondary?: string[];
}

export class BrandAiAssistantDto {
  @ApiProperty({
    description: 'Acción a ejecutar',
    enum: BrandAiAction,
    example: BrandAiAction.GENERATE_CLAIM,
  })
  @IsEnum(BrandAiAction, {
    message:
      'Acción inválida. Usa: generate_claim, extract_colors, generate_color_palette, diagnose_brand_identity',
  })
  action: BrandAiAction;

  @ApiPropertyOptional({
    description: 'ID del usuario — requerido para generate_claim',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'URL pública del logo — requerido para extract_colors',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Descripción del negocio',
    example: 'Vendo muñecos tejidos personalizados hechos a mano',
  })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la marca',
    example: 'Cositas Lindas',
  })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({
    description:
      'Colores primarios en hex — requerido para generate_color_palette',
    type: [String],
    example: ['#FF5733', '#C70039'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryColors?: string[];

  @ApiPropertyOptional({
    description: 'Colores de la marca — para diagnose_brand_identity',
    type: BrandColorsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandColorsDto)
  colors?: BrandColorsDto;

  @ApiPropertyOptional({
    description:
      'Percepción del artesano sobre su marca — para diagnose_brand_identity',
    type: BrandPerceptionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandPerceptionDto)
  perception?: BrandPerceptionDto;
}
