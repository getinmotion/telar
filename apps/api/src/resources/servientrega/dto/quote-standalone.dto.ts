import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PieceDto {
  @ApiProperty({ description: 'Peso en kg', example: 2 })
  @IsNumber()
  @Min(0)
  peso: number;

  @ApiProperty({ description: 'Largo en cm', example: 30 })
  @IsNumber()
  @Min(0)
  largo: number;

  @ApiProperty({ description: 'Ancho en cm', example: 20 })
  @IsNumber()
  @Min(0)
  ancho: number;

  @ApiProperty({ description: 'Alto en cm', example: 15 })
  @IsNumber()
  @Min(0)
  alto: number;
}

export class QuoteStandaloneDto {
  @ApiProperty({
    description: 'Lista de piezas a enviar',
    type: [PieceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDto)
  pieces: PieceDto[];

  @ApiProperty({
    description: 'Valor declarado en COP',
    example: 150000,
  })
  @IsNumber()
  @Min(0)
  valorDeclarado: number;

  @ApiProperty({
    description: 'Codigo DANE ciudad origen (sin 000)',
    example: '11001',
  })
  @IsString()
  @IsNotEmpty()
  idCityOrigen: string;

  @ApiProperty({
    description: 'Codigo DANE ciudad destino (sin 000)',
    example: '76001',
  })
  @IsString()
  @IsNotEmpty()
  idCityDestino: string;
}
