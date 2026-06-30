import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el objeto status
 */
class StatusDto {
  @ApiProperty({ example: 'success' })
  code: string;

  @ApiProperty({ example: true })
  saved: boolean;
}

/**
 * DTO para el objeto oraculo
 */
class OraculoDto {
  @ApiProperty({ example: '¡Casi listo!' })
  title: string;

  @ApiProperty({
    example: 'Tu pieza tiene precio definido (COP 95,000), logística configurada y disponibilidad: disponible ahora.'
  })
  body: string;

  @ApiProperty({
    example: 'Revisa cómo se verá tu pieza en la tienda antes de publicarla.'
  })
  next_step_hint: string;
}

/**
 * DTO para la respuesta del Step 2 Confirm
 */
export class Step2ConfirmResponseDto {
  @ApiProperty({ example: '6f9bd4a2-f42a-4ada-8ffa-13a575a4fe72' })
  product_draft_id: string;

  @ApiProperty({ example: 'step_4_pricing_logistics_confirm' })
  step: string;

  @ApiProperty({ type: StatusDto })
  status: StatusDto;

  @ApiProperty({ type: OraculoDto })
  oraculo: OraculoDto;
}
