import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @ApiProperty({
    description: 'ID de la variante de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productVariantId: string;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.IN,
  })
  @IsEnum(MovementType)
  @IsNotEmpty()
  type: MovementType;

  @ApiProperty({
    description: 'Cantidad del movimiento (siempre positivo)',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  qty: number;

  @ApiPropertyOptional({
    description: 'Razón del movimiento',
    example: 'Compra de inventario inicial',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'ID de referencia (order_id, return_id, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  refId?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea el movimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
