import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsObject,
} from 'class-validator';

export class CreateShopModerationHistoryDto {
  @ApiProperty({ description: 'ID de la tienda' })
  @IsUUID()
  @IsNotEmpty()
  shopId!: string;

  @ApiPropertyOptional({ description: 'Estado anterior de la tienda' })
  @IsString()
  @IsOptional()
  previousStatus?: string;

  @ApiProperty({ description: 'Nuevo estado de la tienda', example: 'marketplace_approved' })
  @IsString()
  @IsNotEmpty()
  newStatus!: string;

  @ApiProperty({
    description: 'Tipo de acción',
    example: 'marketplace_approval',
    enum: ['marketplace_approval', 'publish', 'delete', 'edit'],
  })
  @IsString()
  @IsNotEmpty()
  actionType!: string;

  @ApiPropertyOptional({ description: 'ID del moderador' })
  @IsUUID()
  @IsOptional()
  moderatorId?: string;

  @ApiPropertyOptional({ description: 'Comentario del moderador' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ description: 'Ediciones realizadas en formato JSON' })
  @IsObject()
  @IsOptional()
  editsMade?: Record<string, any>;
}
