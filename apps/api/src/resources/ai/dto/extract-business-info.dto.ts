import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtractBusinessInfoDto {
  @ApiProperty({
    description: 'Texto descriptivo del negocio del usuario',
    example:
      'Mi marca se llama Tejidos Luna y hago textiles artesanales desde Oaxaca',
    minLength: 10,
  })
  @IsString({ message: 'El texto debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El texto es obligatorio' })
  @MinLength(10, { message: 'El texto debe tener al menos 10 caracteres' })
  userText: string;

  @ApiProperty({
    description: 'Campos a extraer de la descripción',
    example: ['brand_name', 'craft_type', 'business_location', 'unique_value'],
    type: [String],
  })
  @IsArray({ message: 'Los campos deben ser un array' })
  @IsNotEmpty({ message: 'Debe especificar al menos un campo a extraer' })
  fieldsToExtract: string[];

  @ApiPropertyOptional({
    description: 'Idioma para los mensajes de respuesta',
    example: 'es',
    default: 'es',
  })
  @IsString()
  @IsOptional()
  language?: string;
}
