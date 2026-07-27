import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductIdentityDto {
  @ApiProperty({
    description: 'Clave única para identificar el producto (usada en QR)',
    example: 'TELAR-CERT-2026-ABC123XYZ',
    maxLength: 255,
  })
  @IsString({ message: 'La clave de identidad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La clave de identidad es obligatoria' })
  @MaxLength(255, {
    message: 'La clave de identidad no puede exceder 255 caracteres',
  })
  identityKey: string;

  @ApiProperty({
    description: 'ID del producto core',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productId: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID de la tienda debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la tienda es obligatorio' })
  storeId: string;

  @ApiProperty({
    description: 'ID del perfil del artesano',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', {
    message: 'El ID del perfil del artesano debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del perfil del artesano es obligatorio' })
  artisanId: string;

  @ApiPropertyOptional({
    description: 'Indica si la identidad está activa',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo isActive debe ser un valor booleano' })
  isActive?: boolean;
}
