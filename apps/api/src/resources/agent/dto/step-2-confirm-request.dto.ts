import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para campos con source, originalAiValue y timestamp
 */
class ContentFieldDto {
  @ApiProperty({ example: 'ia_accepted' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'Valor generado por IA' })
  @IsString()
  originalAiValue: string;

  @ApiProperty({ example: '2026-06-17T21:18:47.890Z' })
  @IsDateString()
  timestamp: string;
}

/**
 * DTO para el request del Step 2 Confirm (Pricing & Logistics)
 */
export class Step2ConfirmRequestDto {
  @ApiProperty({ example: 'b3ec84c6-948a-4a73-81bb-bcd2ae66b708' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '17afaed8-c2e6-4b1f-9a32-2bda3961c869' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  artisanalHistory: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  shortDescription: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  careNotes: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  elaborationTime: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  monthlyCapacity: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  processDescription: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  price: ContentFieldDto;

  @ApiProperty({ type: ContentFieldDto })
  @ValidateNested()
  @Type(() => ContentFieldDto)
  weightKg: ContentFieldDto;
}
