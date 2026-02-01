import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperación recibido por email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'El token de recuperación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token de recuperación es obligatorio' })
  recoveryToken: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres, debe contener mayúscula, minúscula y número)',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 255,
  })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255, { message: 'La nueva contraseña no puede exceder 255 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  newPassword: string;
}

