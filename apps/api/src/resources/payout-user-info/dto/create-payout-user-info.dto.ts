import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayoutUserInfoDto {
  @ApiProperty({
    description: 'Nombre principal del payout',
    example: 'Cuenta principal',
  })
  @IsString()
  @IsNotEmpty()
  namePayoutMain: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Tipo de cuenta',
    example: 'Ahorros',
  })
  @IsString()
  @IsNotEmpty()
  typeAccount: string;

  @ApiProperty({
    description: 'Nombre del banco (será encriptado)',
    example: 'Banco de Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    description: 'Número de cuenta (será encriptado)',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  numAccount: string;

  @ApiProperty({
    description: 'ID del país',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  countryId: string;

  @ApiProperty({
    description: 'Código de moneda',
    example: 'COP',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea el registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @ApiProperty({
    description: 'Tipo de identificación del usuario',
    example: 'CC',
  })
  @IsString()
  @IsNotEmpty()
  idType!: string;

  @ApiProperty({
    description: 'Número de identificación del usuario',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  idNumber!: string;
}
