import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutUserInfo } from '../entities/payout-user-info.entity';

export class PayoutUserInfoResponseDto extends PayoutUserInfo {
  @ApiPropertyOptional({
    description: 'Tipo de identificación del usuario',
    example: 'CC',
  })
  idType?: string;

  @ApiPropertyOptional({
    description: 'Número de identificación del usuario (desencriptado)',
    example: '1234567890',
  })
  idNumber?: string;
}
