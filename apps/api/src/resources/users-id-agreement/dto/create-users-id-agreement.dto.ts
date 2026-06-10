import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateUsersIdAgreementDto {
  @ApiProperty({ description: 'UUID del tipo de ID' })
  @IsUUID()
  @IsNotEmpty()
  idType!: string;

  @ApiProperty({ description: 'Número de identificación (se encriptará)' })
  @IsString()
  @IsNotEmpty()
  numId!: string;

  @ApiProperty({ description: 'UUID del convenio' })
  @IsUUID()
  @IsNotEmpty()
  agreementId!: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
