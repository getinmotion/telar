import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BankDataDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  holder_name: string;

  @ApiProperty({ example: 'cc', enum: ['cc', 'pa', 'nit', 'ce'] })
  @IsString()
  @IsNotEmpty()
  document_type: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  document_number: string;

  @ApiProperty({ example: '0040' })
  @IsString()
  @IsNotEmpty()
  bank_code: string;

  @ApiProperty({ example: 'ch', enum: ['ch', 'cc', 'r2p', 'dp', 'breb-key', 'r2p_breb'] })
  @IsString()
  @IsNotEmpty()
  account_type: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  account_number: string;
}

export class CreateCounterpartyAdminDto {
  @ApiProperty({ description: 'ID de la tienda artesanal' })
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @ApiProperty({ description: 'Datos bancarios del artesano' })
  @IsObject()
  @ValidateNested()
  @Type(() => BankDataDto)
  bankData: BankDataDto;
}
