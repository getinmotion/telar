import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateShopSuggestionsDto {
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
    description: 'Contexto del usuario para generar sugerencias',
  })
  @IsObject()
  @IsOptional()
  userContext?: {
    businessDescription?: string;
    brandName?: string;
    businessLocation?: string;
    businessGoals?: string[];
    socialMediaPresence?: Record<string, any>;
    businessProfile?: Record<string, any>;
    maturityLevel?: number;
  };
}
