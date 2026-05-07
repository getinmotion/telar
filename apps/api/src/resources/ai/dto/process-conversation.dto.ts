import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsIn, IsArray, IsObject, IsOptional } from 'class-validator';

export class ProcessConversationDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

  @ApiProperty({
    description: 'Respuesta del usuario a la pregunta actual',
    example: 'Mi tienda se llama Artesanías Doña María',
  })
  @IsString({ message: 'La respuesta del usuario debe ser un texto' })
  userResponse: string;

  @ApiProperty({
    description: 'Pregunta actual del flujo conversacional',
    enum: ['business_name', 'business_products', 'business_location'],
    example: 'business_name',
  })
  @IsIn(['business_name', 'business_products', 'business_location'], {
    message: 'La pregunta actual debe ser business_name, business_products o business_location',
  })
  currentQuestion: string;

  @ApiPropertyOptional({
    description: 'Historial de la conversación',
    example: [
      {
        question: '¿Cuál es el nombre de tu negocio?',
        answer: 'Artesanías Doña María',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    ],
  })
  @IsArray({ message: 'El historial debe ser un arreglo' })
  @IsOptional()
  conversationHistory?: any[];

  @ApiPropertyOptional({
    description: 'Datos actuales de la tienda',
    example: {
      shop_name: 'Artesanías Doña María',
    },
  })
  @IsObject({ message: 'Los datos de la tienda deben ser un objeto' })
  @IsOptional()
  shopData?: any;

  @ApiPropertyOptional({
    description: 'Idioma de las respuestas',
    example: 'es',
    enum: ['es', 'en'],
    default: 'es',
  })
  @IsOptional()
  @IsIn(['es', 'en'], { message: 'El idioma debe ser es o en' })
  language?: string = 'es';
}
