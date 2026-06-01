import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class FaqItemDto {
  @ApiPropertyOptional({ description: 'Pregunta', example: '¿Hacen envíos internacionales?' })
  @IsString({ message: 'La pregunta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La pregunta no puede estar vacía' })
  q: string;

  @ApiPropertyOptional({ description: 'Respuesta', example: 'Sí, enviamos a todo el mundo.' })
  @IsString({ message: 'La respuesta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La respuesta no puede estar vacía' })
  a: string;
}

export class CreateStorePoliciesConfigDto {
  @ApiPropertyOptional({
    description: 'Texto de la política de devoluciones',
    example: 'Aceptamos devoluciones dentro de los 30 días siguientes a la compra...',
  })
  @IsOptional()
  @IsString({ message: 'La política de devoluciones debe ser una cadena de texto' })
  returnPolicy?: string;

  @ApiPropertyOptional({
    description: 'Preguntas frecuentes de la tienda',
    type: [FaqItemDto],
    example: [{ q: '¿Hacen envíos internacionales?', a: 'Sí, enviamos a todo el mundo.' }],
  })
  @IsOptional()
  @IsArray({ message: 'El FAQ debe ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faq?: FaqItemDto[];
}
