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
  @ApiProperty({ example: 'Identidad confirmada' })
  title: string;

  @ApiProperty({
    example: 'Tu pieza está categorizada como Joyería y Accesorios con técnica de Joyería artesanal.'
  })
  body: string;

  @ApiProperty({
    example: 'Sube fotos del proceso para que detectemos fases y herramientas utilizadas.'
  })
  next_step_hint: string;
}

/**
 * DTO para la respuesta del Step 1 Confirm
 */
export class Step1ConfirmResponseDto {
  @ApiProperty({ example: '6f9bd4a2-f42a-4ada-8ffa-13a575a4fe72' })
  product_draft_id: string;

  @ApiProperty({ example: 'step_2_artisan_identity_confirm' })
  step: string;

  @ApiProperty({ type: StatusDto })
  status: StatusDto;

  @ApiProperty({ type: OraculoDto })
  oraculo: OraculoDto;
}
