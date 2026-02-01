import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateProductSuggestionsDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Idioma para las sugerencias',
    example: 'es',
    default: 'es',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Información de la tienda',
  })
  @IsObject()
  @IsOptional()
  shop?: {
    shopName?: string;
    craftType?: string;
    region?: string;
    description?: string;
  };

  @ApiPropertyOptional({
    description: 'Contexto adicional del negocio',
  })
  @IsObject()
  @IsOptional()
  context?: {
    businessProfile?: Record<string, any>;
  };
}
