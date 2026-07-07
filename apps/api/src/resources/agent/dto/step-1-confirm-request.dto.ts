import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para campos con source, originalAiValue y timestamp
 * originalAiValue puede estar vacío cuando source es 'manual'
 */
class ContentFieldDto {
  @ApiProperty({ example: 'ia_accepted' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    example: 'Esta elegante silla de comedor está elaborada en robusta madera de roble...',
    description: 'Puede estar vacío cuando source es manual'
  })
  @IsString()
  originalAiValue: string;

  @ApiProperty({ example: '2026-06-15T22:33:23.991Z' })
  @IsDateString()
  timestamp: string;
}

/**
 * DTO para selección de categoría u oficio
 * value y label pueden estar vacíos cuando source es 'manual'
 */
class SelectionDto {
  @ApiProperty({
    example: '42c48a1e-1463-4279-8753-72c5e96cb9ed',
    description: 'Puede estar vacío cuando source es manual'
  })
  @IsString()
  value: string;

  @ApiProperty({
    example: 'Sillas',
    description: 'Puede estar vacío cuando source es manual'
  })
  @IsString()
  label: string;

  @ApiProperty({ example: 'ia_accepted' })
  @IsString()
  @IsNotEmpty()
  source: string;
}

/**
 * DTO para materiales seleccionados
 * value y label pueden estar vacíos cuando source es 'manual'
 */
class MaterialSelectionDto {
  @ApiProperty({
    example: 'b4c097d5-2f77-44b2-ba0b-6ba4ec7ae984',
    description: 'Puede estar vacío cuando source es manual'
  })
  @IsString()
  value: string;

  @ApiProperty({
    example: 'Madera De Roble',
    description: 'Puede estar vacío cuando source es manual'
  })
  @IsString()
  label: string;

  @ApiProperty({ example: 'ia_accepted' })
  @IsString()
  @IsNotEmpty()
  source: string;
}

/**
 * DTO para el request del Step 1 Confirm
 */
export class Step1ConfirmRequestDto {
  @ApiProperty({ example: 'fc2466d1-cd15-4749-9728-1ab7f6d80edd' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '48bf55a5-fe09-41a3-b0bc-624f194578e3' })
  @IsUUID()
  @IsNotEmpty()
  productDraftId: string;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  shortDescription: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  artisanalHistory: ContentFieldDto;

  @ApiProperty({ type: SelectionDto })
  @ValidateNested()
  @Type(() => SelectionDto)
  category: SelectionDto;

  @ApiProperty({ type: SelectionDto })
  @ValidateNested()
  @Type(() => SelectionDto)
  oficio: SelectionDto;

  @ApiProperty({ type: [MaterialSelectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialSelectionDto)
  materials: MaterialSelectionDto[];
}
