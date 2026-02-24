import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Cerámica',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description:
      'Slug único de la categoría (URL amigable, solo letras minúsculas, números y guiones)',
    example: 'ceramica',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @MinLength(2, { message: 'El slug debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El slug no puede exceder 100 caracteres' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug debe contener solo letras minúsculas, números y guiones (sin espacios)',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Productos de cerámica artesanal hechos a mano',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría padre (para jerarquía)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El parentId debe ser un UUID válido' })
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El orden de visualización debe ser un número' })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Indica si la categoría está activa',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'URL de imagen de la categoría',
    example: 'https://example.com/category-image.jpg',
  })
  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser una cadena de texto' })
  imageUrl?: string;
}
