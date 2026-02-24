import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandThemeDto {
  @ApiPropertyOptional({
    description: 'ID del usuario propietario del tema',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId?: string;

  @ApiProperty({
    description: 'Identificador único del tema',
    example: 'theme-ocean-blue-2024',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El themeId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El themeId es obligatorio' })
  @MinLength(3, { message: 'El themeId debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El themeId no puede exceder 100 caracteres' })
  themeId: string;

  @ApiPropertyOptional({
    description: 'Versión del tema',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La version debe ser un número' })
  version?: number;

  @ApiPropertyOptional({
    description: 'Indica si el tema está activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Paleta de colores del tema en formato JSON',
    example: {
      primary: '#007BFF',
      secondary: '#6C757D',
      accent: '#FFC107',
    },
  })
  @IsNotEmpty({ message: 'La paleta de colores es obligatoria' })
  @IsObject({ message: 'La paleta debe ser un objeto JSON válido' })
  palette: object;

  @ApiPropertyOptional({
    description: 'Contexto de estilos del tema',
    example: {
      typography: 'Roboto',
      borderRadius: '8px',
    },
  })
  @IsOptional()
  @IsObject({ message: 'styleContext debe ser un objeto JSON válido' })
  styleContext?: object;

  @ApiPropertyOptional({
    description: 'Reglas de uso del tema',
    example: {
      allowCustomization: true,
      restrictedColors: [],
    },
  })
  @IsOptional()
  @IsObject({ message: 'usageRules debe ser un objeto JSON válido' })
  usageRules?: object;

  @ApiPropertyOptional({
    description: 'Descripción para previsualización',
    example: 'Tema moderno con colores oceánicos',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  previewDescription?: string;
}
