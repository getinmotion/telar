import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * DTO para solicitar cotización de envío con Servientrega
 */
export class QuoteShippingDto {
  @ApiProperty({
    description: 'ID del carrito para cotizar envío',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El cart_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El cart_id es requerido' })
  cart_id!: string;

  @ApiProperty({
    description: 'Código DANE de la ciudad destino (5 dígitos)',
    example: '11001',
  })
  @IsString({ message: 'El idCityDestino debe ser un string' })
  @IsNotEmpty({ message: 'El idCityDestino es requerido' })
  idCityDestino!: string;
}
