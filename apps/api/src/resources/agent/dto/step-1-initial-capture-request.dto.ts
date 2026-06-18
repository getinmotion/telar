import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsArray, IsOptional, ValidateNested, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para los archivos multimedia del producto
 */
class MediaDto {
  @ApiProperty({ example: 'https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/products/1781273013775_348.webp' })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ example: 'image' })
  @IsString()
  @IsNotEmpty()
  mediaType: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isPrimary: boolean;

  @ApiProperty({ example: 0 })
  @IsNumber()
  displayOrder: number;
}

/**
 * DTO para la identidad artesanal del producto
 */
class ArtisanalIdentityDto {
  @ApiProperty({ example: '3aaab634-1a9d-4e38-89a3-3eb65cd1a1c4' })
  @IsUUID()
  @IsNotEmpty()
  primaryCraftId: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isCollaboration: boolean;
}

/**
 * DTO para la petición del paso 1: Captura inicial del producto
 */
export class Step1InitialCaptureRequestDto {
  @ApiProperty({ example: '01cad568-37b2-490f-87e4-90ebbf996323' })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ example: 'VASIJA DE MADERA YU' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Descripción breve del producto' })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({ example: 'Historia del producto' })
  @IsString()
  @IsNotEmpty()
  history: string;

  @ApiProperty({ example: 'draft' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ type: [MediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media: MediaDto[];

  @ApiProperty({ type: ArtisanalIdentityDto })
  @ValidateNested()
  @Type(() => ArtisanalIdentityDto)
  artisanalIdentity: ArtisanalIdentityDto;
}
