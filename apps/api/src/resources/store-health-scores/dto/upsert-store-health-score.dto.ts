import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class UpsertStoreHealthScoreDto {
  @ApiProperty({ description: 'ID de la tienda' })
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @ApiPropertyOptional({ description: 'Score total (0-100)' })
  @IsInt() @Min(0) @Max(100) @IsOptional()
  scoreTotal?: number;

  @ApiPropertyOptional({ description: 'Score branding (0-25)' })
  @IsInt() @Min(0) @Max(25) @IsOptional()
  scoreBranding?: number;

  @ApiPropertyOptional({ description: 'Score catálogo (0-25)' })
  @IsInt() @Min(0) @Max(25) @IsOptional()
  scoreCatalog?: number;

  @ApiPropertyOptional({ description: 'Score narrativa (0-25)' })
  @IsInt() @Min(0) @Max(25) @IsOptional()
  scoreNarrative?: number;

  @ApiPropertyOptional({ description: 'Score consistencia (0-25)' })
  @IsInt() @Min(0) @Max(25) @IsOptional()
  scoreConsistency?: number;
}
