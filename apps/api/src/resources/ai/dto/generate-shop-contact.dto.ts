import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateShopContactDto {
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
    description: 'Región de la tienda',
    example: 'La Guajira',
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    description: 'Claim o frase de marca',
    example: 'Tejiendo tradición en cada pieza',
  })
  @IsString()
  @IsOptional()
  brandClaim?: string;
}

export interface GenerateShopContactResponse {
  welcomeMessage: string;
  formIntroText: string;
  suggestedHours: string;
  contactPageTitle: string;
}
