import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsObject, IsOptional, IsIn } from 'class-validator';
import { ShopData } from '../types/intelligent-shop.types';

export class GenerateShopProductSuggestionsDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

  @ApiProperty({
    description: 'Datos de la tienda para generar sugerencias',
    example: {
      shop_name: 'Artesanías Doña María',
      craft_type: 'textiles',
      region: 'Bogotá',
      description: 'Tienda de textiles artesanales',
    },
  })
  @IsObject({ message: 'Los datos de la tienda deben ser un objeto' })
  shopData: Partial<ShopData>;

  @ApiPropertyOptional({
    description: 'Idioma de las respuestas',
    example: 'es',
    enum: ['es', 'en'],
    default: 'es',
  })
  @IsOptional()
  @IsIn(['es', 'en'], { message: 'El idioma debe ser es o en' })
  language?: string = 'es';
}
