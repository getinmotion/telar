import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEmail,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCartShippingInfoDto {
  @ApiProperty({
    description: 'ID del carrito asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  cartId!: string;

  @ApiProperty({
    description: 'Nombre completo del destinatario',
    example: 'Juan Pérez García',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({
    description: 'Correo electrónico del destinatario',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Teléfono del destinatario',
    example: '+573001234567',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone!: string;

  @ApiProperty({
    description: 'Dirección de envío completa',
    example: 'Calle 123 #45-67 Apto 301',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description: 'Código DANE de la ciudad (5 dígitos)',
    example: 11001,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  daneCiudad!: number;

  @ApiProperty({
    description: 'Descripción de la ciudad',
    example: 'Bogotá D.C.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descCiudad!: string;

  @ApiProperty({
    description: 'Descripción del departamento',
    example: 'Cundinamarca',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descDepart!: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({
    description: 'Descripción del tipo de envío',
    example: 'Envío estándar - Servientrega',
  })
  @IsString()
  @IsNotEmpty()
  descEnvio!: string;

  @ApiProperty({
    description: 'Número de guía de envío (opcional)',
    example: 'SER123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  numGuia?: string;

  @ApiProperty({
    description: 'Valor del flete en menores (centavos)',
    example: 1500000,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  valorFleteMinor?: number;

  @ApiProperty({
    description: 'Valor adicional sobre el flete en menores (centavos)',
    example: 200000,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  valorSobreFleteMinor?: number;

  @ApiProperty({
    description: 'Valor total del flete en menores (centavos)',
    example: 1700000,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  valorTotalFleteMinor?: number;
}
