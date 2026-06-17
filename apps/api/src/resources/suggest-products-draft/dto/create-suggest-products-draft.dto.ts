import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

/**
 * DTO para crear un nuevo registro de sugerencias de productos draft
 */
export class CreateSuggestProductsDraftDto {
  @ApiProperty({
    description: 'ID del producto en shop.product_core',
    example: '01cad568-37b2-490f-87e4-90ebbf996323',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    description: 'Response del agente para steps 1-2 (captura inicial y confirmación de identidad)',
    example: {},
  })
  @IsOptional()
  @IsObject()
  suggestAgentStep12?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Response del agente para steps 3-4 (proceso de registro y pricing/logística)',
    example: {},
  })
  @IsOptional()
  @IsObject()
  suggestAgentStep34?: Record<string, any>;
}
