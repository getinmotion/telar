import { ApiProperty } from '@nestjs/swagger';

class MetadataDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  artisan_id!: string;

  @ApiProperty({ example: '2026-06-10T12:00:00Z' })
  processed_at!: string;

  @ApiProperty({ example: '1.0.0' })
  form_version!: string;
}

class StatusDto {
  @ApiProperty({ example: 'success' })
  code!: string;

  @ApiProperty({ example: true })
  onboarding_complete!: boolean;
}

class MessageDto {
  @ApiProperty({ example: 'Bienvenido a Telar' })
  title!: string;

  @ApiProperty({ example: 'Tu perfil ha sido procesado exitosamente' })
  body!: string;
}

class NextPriorityActionDto {
  @ApiProperty({
    example: 'entender_precios',
    description: 'Acción prioritaria basada en la pregunta 16',
  })
  based_on_q16!: string;

  @ApiProperty({
    type: [String],
    example: [
      'Definir estructura de costos',
      'Establecer precios competitivos',
      'Crear estrategia de pricing',
    ],
  })
  recommendations!: string[];
}

class DimensionScoreDto {
  @ApiProperty({
    example: 'en_desarrollo',
    enum: ['emergente', 'en_desarrollo', 'consolidado'],
  })
  maturity_level!: string;

  @ApiProperty({
    example: 'El artesano tiene claridad sobre su técnica pero le falta definir su diferenciación frente a otros artesanos de la región.',
  })
  reasoning!: string;

  @ApiProperty({
    type: [String],
    example: [
      'Crear una lista de 10 características únicas de tus productos',
      'Definir tu historia de marca en un párrafo',
    ],
  })
  tasks!: string[];
}

class DimensionsBreakdownDto {
  @ApiProperty({ type: DimensionScoreDto })
  identidad_artesanal!: DimensionScoreDto;

  @ApiProperty({ type: DimensionScoreDto })
  realidad_comercial!: DimensionScoreDto;

  @ApiProperty({ type: DimensionScoreDto })
  clientes_y_mercado!: DimensionScoreDto;

  @ApiProperty({ type: DimensionScoreDto })
  operacion_y_crecimiento!: DimensionScoreDto;
}

class OnboardingResponseDataDto {
  @ApiProperty({ type: MetadataDto })
  metadata!: MetadataDto;

  @ApiProperty({ type: StatusDto })
  status!: StatusDto;

  @ApiProperty({
    example: 'emergente',
    enum: ['emergente', 'en_desarrollo', 'consolidado'],
    description: 'Nivel de madurez general (promedio de las 4 dimensiones)',
  })
  maturity_level!: string;

  @ApiProperty({ type: MessageDto })
  message!: MessageDto;

  @ApiProperty({
    type: DimensionsBreakdownDto,
    description: 'Detalle de madurez por cada una de las 4 dimensiones evaluadas',
  })
  dimensions!: DimensionsBreakdownDto;

  @ApiProperty({ type: NextPriorityActionDto })
  next_priority_action!: NextPriorityActionDto;
}

/**
 * DTO para la respuesta de onboarding del servicio de agentes
 */
export class OnboardingResponseDto {
  @ApiProperty({ type: OnboardingResponseDataDto })
  onboarding_response!: OnboardingResponseDataDto;
}
