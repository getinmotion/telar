import { IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePassportUserDto {
  @ApiProperty({
    description: 'ID de la identidad del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', {
    message: 'El ID de la identidad del producto debe ser un UUID válido',
  })
  @IsNotEmpty({
    message: 'El ID de la identidad del producto es obligatorio',
  })
  passportIdentityId: string;

  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', {
    message: 'El ID del usuario comprador debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del usuario comprador es obligatorio' })
  userPassportId: string;

  @ApiPropertyOptional({
    description: 'Indica si la relación está activa',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo isActive debe ser un valor booleano' })
  isActive?: boolean;
}
