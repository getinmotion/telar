import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Etiqueta de la dirección',
    example: 'Casa',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label!: string;

  @ApiProperty({
    description: 'Dirección de la calle',
    example: 'Calle 123 #45-67',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  streetAddress!: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Bogotá',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({
    description: 'Departamento o estado',
    example: 'Cundinamarca',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({
    description: 'País',
    example: 'Colombia',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @ApiProperty({
    description: 'Indica si es la dirección por defecto',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Código DANE de la ubicación',
    example: '11001',
    required: false,
    nullable: true,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  daneCode?: string | null;
}
