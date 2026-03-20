import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingDataDto {
  @ApiProperty({
    description: 'ID del registro de shipping_data',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ID del carrito asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  cart_id: string;

  @ApiProperty({
    description: 'Nombre completo del destinatario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Email del destinatario',
    example: 'juan@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Teléfono del destinatario',
    example: '3001234567',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Dirección de envío',
    example: 'Calle 123 #45-67 Apto 101',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Código DANE de la ciudad',
    example: 11001,
  })
  @IsNumber()
  @IsNotEmpty()
  dane_ciudad: number;

  @ApiProperty({
    description: 'Nombre de la ciudad',
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  desc_ciudad: string;

  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Cundinamarca',
  })
  @IsString()
  @IsNotEmpty()
  desc_depart: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
  })
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty({
    description: 'Descripción del envío',
    example: 'Artesanías varias',
  })
  @IsString()
  @IsNotEmpty()
  desc_envio: string;

  @ApiProperty({
    description: 'Valor del flete',
    example: 15000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  valor_flete?: number;

  @ApiProperty({
    description: 'Valor sobre flete',
    example: 5000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  valor_sobre_flete?: number;

  @ApiProperty({
    description: 'Valor total del flete',
    example: 20000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  valor_total_flete?: number;
}

export class GenerateGuideDto {
  @ApiProperty({
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  cart_id: string;

  @ApiProperty({
    description: 'Datos de envío del destinatario',
    type: ShippingDataDto,
  })
  @ValidateNested()
  @Type(() => ShippingDataDto)
  @IsNotEmpty()
  shipping_data: ShippingDataDto;
}

export interface GuideResult {
  shop_id: string;
  shop_name: string;
  num_guia: string | null;
  success: boolean;
  error?: string;
}

export interface GenerateGuideResponse {
  success: boolean;
  guides: GuideResult[];
  error?: string;
}
