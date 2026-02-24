import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserMasterContextDto {
  @ApiProperty({
    description: 'ID del usuario asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Contexto de negocio del usuario',
    example: {
      industry: 'Artesanías',
      businessSize: 'small',
      yearsInBusiness: 5,
    },
  })
  @IsOptional()
  @IsObject({ message: 'El contexto de negocio debe ser un objeto' })
  businessContext?: object;

  @ApiPropertyOptional({
    description: 'Preferencias del usuario',
    example: {
      theme: 'light',
      notifications: true,
      emailFrequency: 'weekly',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Las preferencias deben ser un objeto' })
  preferences?: object;

  @ApiPropertyOptional({
    description: 'Insights de conversaciones con el usuario',
    example: {
      commonTopics: ['marketing', 'ventas'],
      sentiment: 'positive',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Los insights de conversación deben ser un objeto' })
  conversationInsights?: object;

  @ApiPropertyOptional({
    description: 'Detalles técnicos del usuario',
    example: {
      hasWebsite: true,
      usesSocialMedia: ['Instagram', 'Facebook'],
    },
  })
  @IsOptional()
  @IsObject({ message: 'Los detalles técnicos deben ser un objeto' })
  technicalDetails?: object;

  @ApiPropertyOptional({
    description: 'Metas y objetivos del usuario',
    example: {
      shortTerm: 'Aumentar ventas 20%',
      longTerm: 'Expandir a otros mercados',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Las metas y objetivos deben ser un objeto' })
  goalsAndObjectives?: object;

  @ApiPropertyOptional({
    description: 'Versión del contexto',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La versión del contexto debe ser un número' })
  contextVersion?: number;

  @ApiPropertyOptional({
    description: 'Perfil de negocio del usuario',
    example: {
      targetMarket: 'Nacional',
      productCategories: ['Cerámica', 'Textiles'],
    },
  })
  @IsOptional()
  @IsObject({ message: 'El perfil de negocio debe ser un objeto' })
  businessProfile?: object;

  @ApiPropertyOptional({
    description: 'Contexto para generación de tareas',
    example: {
      priorityAreas: ['marketing', 'operaciones'],
      currentChallenges: ['bajo tráfico web'],
    },
  })
  @IsOptional()
  @IsObject({ message: 'El contexto de generación de tareas debe ser un objeto' })
  taskGenerationContext?: object;

  @ApiPropertyOptional({
    description: 'Preferencia de idioma',
    example: 'es',
    default: 'es',
  })
  @IsOptional()
  @IsString({ message: 'La preferencia de idioma debe ser una cadena de texto' })
  languagePreference?: string;
}
