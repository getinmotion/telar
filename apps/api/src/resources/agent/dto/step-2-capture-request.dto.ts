import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsArray } from 'class-validator';

/**
 * DTO para el request del Step 2 Capture (Process Registration)
 */
export class Step2CaptureRequestDto {
  @ApiProperty({ example: 'b3ec84c6-948a-4a73-81bb-bcd2ae66b708' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '57d2684f-b8a8-4c9f-9aa2-beca799b52cf' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 'Uno de los principales procesos es la búsqueda de la madera para la iniciación del corte para la construcción de la silla'
  })
  @IsString()
  @IsNotEmpty()
  processDescription: string;

  @ApiProperty({
    example: [
      'https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/products/1781615512901_983.jpg'
    ]
  })
  @IsArray()
  @IsString({ each: true })
  processEvidenceUrls: string[];
}
