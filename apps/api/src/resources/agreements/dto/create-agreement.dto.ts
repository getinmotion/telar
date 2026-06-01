import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgreementDto {
  @ApiProperty({
    description: 'Nombre del acuerdo',
    example: 'Acuerdo Comercial Internacional',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiPropertyOptional({
    description: 'ID de permiso en MongoDB',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString({ message: 'El ID de permiso debe ser una cadena de texto' })
  permissionMongoId?: string;

  @ApiPropertyOptional({
    description: 'Indica si la validación está habilitada',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isEnableValidate debe ser un valor booleano' })
  isEnableValidate?: boolean;
}
