import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el objeto status
 */
class StatusDto {
  @ApiProperty({ example: 'success' })
  code: string;

  @ApiProperty({ example: ['producto', 'pricing'] })
  agents_used: string[];
}

/**
 * DTO para elaboration_time dentro de process_analysis
 */
class ElaborationTimeDto {
  @ApiProperty({ example: '1 semana' })
  value: string;

  @ApiProperty({ example: 'ia_generated' })
  source: string;
}

/**
 * DTO para structured_process dentro de process_analysis
 */
class StructuredProcessDto {
  @ApiProperty({
    example: [],
    description: 'Fases detectadas: corte, moldeado, cincelado, pulido, acabado, etc.'
  })
  phases: any[];
}

/**
 * DTO para suggested_price dentro de pricing_suggestions
 */
class SuggestedPriceDto {
  @ApiProperty({ example: 95000 })
  value: number;

  @ApiProperty({ example: 'ia_generated' })
  source: string;
}

/**
 * DTO para el objeto oraculo
 */
class OraculoDto {
  @ApiProperty({ example: 'Proceso documentado' })
  title: string;

  @ApiProperty({
    example: 'Detecté N fase(s) en tu proceso de elaboración y estimé 1 semana de producción.'
  })
  body: string;

  @ApiProperty({
    example: 'En el paso 4 encontrarás el precio sugerido (COP 95,000) y la guía de dimensiones.'
  })
  next_step_hint: string;
}

/**
 * DTO para la respuesta del Step 2 Capture
 */
export class Step2CaptureResponseDto {
  @ApiProperty({ example: '6f9bd4a2-f42a-4ada-8ffa-13a575a4fe72' })
  product_draft_id: string;

  @ApiProperty({ example: 'step_3_process_registration' })
  step: string;

  @ApiProperty({ type: StatusDto })
  status: StatusDto;

  @ApiProperty({
    description: 'Análisis del proceso con campos dinámicos adicionales',
    example: {
      structured_process: { phases: [] },
      elaboration_time: { value: '1 semana', source: 'ia_generated' }
    }
  })
  process_analysis: {
    structured_process: StructuredProcessDto;
    elaboration_time: ElaborationTimeDto;
    [key: string]: any; // Permite campos adicionales no mapeados
  };

  @ApiProperty({
    description: 'Sugerencias de pricing con campos dinámicos adicionales',
    example: {
      suggested_price: { value: 95000, source: 'ia_generated' }
    }
  })
  pricing_suggestions: {
    suggested_price: SuggestedPriceDto;
    [key: string]: any; // Permite campos adicionales no mapeados
  };

  @ApiProperty({ type: OraculoDto })
  oraculo: OraculoDto;
}
