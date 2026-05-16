import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsInt, IsOptional, IsObject, Min, Max } from 'class-validator';

export class UpsertQueueScoreDto {
  @ApiProperty({ description: 'ID del item' })
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ description: 'Tipo de item', example: 'product' })
  @IsString()
  @IsNotEmpty()
  itemType!: string;

  @ApiPropertyOptional({ description: 'Score de prioridad (0-100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  priorityScore?: number;

  @ApiPropertyOptional({ description: 'Score de riesgo (0-100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  riskScore?: number;

  @ApiPropertyOptional({ description: 'Score comercial (0-100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  commercialScore?: number;

  @ApiPropertyOptional({ description: 'Razones que afectaron los scores' })
  @IsObject()
  @IsOptional()
  scoreReasons?: Record<string, any>;
}
