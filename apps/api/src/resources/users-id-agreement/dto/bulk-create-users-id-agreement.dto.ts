import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class BulkCreateUsersIdAgreementDto {
  @ApiProperty({ description: 'Código del tipo de ID (CC, NIT, CE, etc.)' })
  @IsString()
  @IsNotEmpty()
  idTypeValue!: string;

  @ApiProperty({ description: 'Número de identificación' })
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
