import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la respuesta de sugerencias de productos draft
 */
export class SuggestProductsDraftResponseDto {
  @ApiProperty({
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del producto en shop.product_core',
    example: '01cad568-37b2-490f-87e4-90ebbf996323',
  })
  productId: string;

  @ApiPropertyOptional({
    description: 'Response del agente para steps 1-2',
    example: {},
  })
  suggestAgentStep12?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Response del agente para steps 3-4',
    example: {},
  })
  suggestAgentStep34?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-06-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-06-15T10:30:00Z',
  })
  updatedAt: Date;
}
