import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordRecoveryDto {
  @ApiProperty({
    description: 'Email del usuario que solicita recuperación de contraseña',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
}

