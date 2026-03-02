import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetCounterpartyDto {
  @ApiProperty({
    description: 'ID de la contraparte en Cobre',
    example: 'ctp_1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  counterparty_id: string;
}
