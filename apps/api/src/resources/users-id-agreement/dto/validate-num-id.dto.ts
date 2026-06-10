import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ValidateNumIdDto {
  @ApiProperty({ description: 'UUID del tipo de ID' })
  @IsUUID()
  @IsNotEmpty()
  idType!: string;

  @ApiProperty({ description: 'Número de identificación a validar (sin encriptar)' })
  @IsString()
  @IsNotEmpty()
  numId!: string;

  @ApiProperty({ description: 'UUID del convenio' })
  @IsUUID()
  @IsNotEmpty()
  agreementId!: string;
}
