import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para el estado de la respuesta
 */
class StatusDto {
  @ApiProperty({ example: 'success' })
  code: string;

  @ApiProperty({ example: 'producto' })
  agent_used: string;
}

/**
 * DTO para contenido mejorado (descripción o historia)
 */
class ImprovedContentDto {
  @ApiProperty()
  value: string;

  @ApiProperty({ example: 'ia_generated' })
  source: string;

  @ApiProperty()
  changes_summary: string;
}

/**
 * DTO para retroalimentación de foto principal
 */
class MainPhotoFeedbackDto {
  @ApiProperty({ example: 'buena' })
  quality: string;

  @ApiProperty({ type: [String], example: ['Buena iluminación natural', 'Fondo limpio que resalta el producto'] })
  highlights: string[];

  @ApiProperty({ type: [String], example: ['Considera mostrar el producto desde diferentes ángulos'] })
  suggestions: string[];
}

/**
 * DTO para retroalimentación de fotos
 */
class PhotoFeedbackDto {
  @ApiProperty({ type: MainPhotoFeedbackDto })
  main_photo: MainPhotoFeedbackDto;
}

/**
 * DTO para mejoras de contenido
 */
class ContentImprovementsDto {
  @ApiProperty({ type: ImprovedContentDto })
  improved_description: ImprovedContentDto;

  @ApiProperty({ type: ImprovedContentDto })
  improved_history: ImprovedContentDto;

  @ApiProperty({ type: PhotoFeedbackDto })
  photo_feedback: PhotoFeedbackDto;
}

/**
 * DTO para sugerencia de categoría u oficio
 */
class IdentitySuggestionDto {
  @ApiProperty({ example: 'f7afa80a-f16d-496c-8b85-bd03d692eee1' })
  value: string;

  @ApiProperty({ example: 'Joyería y Accesorios' })
  label: string;

  @ApiProperty({ example: 0.91 })
  confidence: number;

  @ApiProperty()
  reasoning: string;
}

/**
 * DTO para sugerencia de material
 */
class MaterialSuggestionDto {
  @ApiProperty({ example: '1078bcf7-b260-4847-8dfc-d8f5ea8e6038' })
  value: string;

  @ApiProperty({ example: 'Metales Preciosos' })
  label: string;

  @ApiProperty({ example: 0.95 })
  confidence: number;
}

/**
 * DTO para sugerencias de identidad artesanal
 */
class IdentitySuggestionsDto {
  @ApiProperty({ type: IdentitySuggestionDto })
  category: IdentitySuggestionDto;

  @ApiProperty({ type: IdentitySuggestionDto })
  oficio: IdentitySuggestionDto;

  @ApiProperty({ type: [MaterialSuggestionDto] })
  materials: MaterialSuggestionDto[];
}

/**
 * DTO para el oráculo (mensajes motivacionales)
 */
class OraculoDto {
  @ApiProperty({ example: 'Brilla con tu arte' })
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  next_step_hint: string;
}

/**
 * DTO para la respuesta del paso 1: Captura inicial del producto
 */
export class Step1InitialCaptureResponseDto {
  @ApiProperty({ example: '6f9bd4a2-f42a-4ada-8ffa-13a575a4fe72' })
  product_draft_id: string;

  @ApiProperty({ example: 'step_1_initial_capture' })
  step: string;

  @ApiProperty({ type: StatusDto })
  status: StatusDto;

  @ApiProperty({ type: ContentImprovementsDto })
  content_improvements: ContentImprovementsDto;

  @ApiProperty({ type: IdentitySuggestionsDto })
  identity_suggestions: IdentitySuggestionsDto;

  @ApiProperty({ type: OraculoDto })
  oraculo: OraculoDto;
}
