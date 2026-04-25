import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsIn } from 'class-validator';

export class AnalyzeProfileDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

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
