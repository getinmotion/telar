import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BankDataDto } from './create-counterparty-admin.dto';

export class CreateCounterpartySelfDto {
  @ApiProperty({ description: 'ID del usuario artesano' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Datos bancarios del artesano' })
  @IsObject()
  @ValidateNested()
  @Type(() => BankDataDto)
  bankData: BankDataDto;
}
