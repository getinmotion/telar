import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileDto {
  @ApiProperty({
    description: 'Key del archivo en S3 o URL completa',
    example: 'images/products/1234567890_0.jpg',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
