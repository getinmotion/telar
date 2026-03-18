import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsObject,
} from 'class-validator';

export class CreateProductModerationHistoryDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({
    description: 'Estado anterior del producto',
    example: 'pending',
  })
  @IsString()
  @IsOptional()
  previousStatus?: string;

  @ApiProperty({
    description: 'Nuevo estado del producto',
    example: 'approved',
  })
  @IsString()
  @IsNotEmpty()
  newStatus!: string;

  @ApiPropertyOptional({
    description: 'ID del moderador que realizó el cambio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  moderatorId?: string;

  @ApiPropertyOptional({
    description: 'ID del artesano propietario del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  artisanId?: string;

  @ApiPropertyOptional({
    description: 'Comentario del moderador',
    example: 'Producto aprobado, cumple con todos los requisitos',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Ediciones realizadas en formato JSON',
    example: { title: 'Antes', description: 'Después' },
  })
  @IsObject()
  @IsOptional()
  editsMade?: Record<string, any>;
}
