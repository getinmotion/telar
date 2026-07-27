import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductIdentityWithEmailDto {
  @ApiProperty({
    description: 'ID del producto core',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productId: string;

  @ApiProperty({
    description: 'Email del comprador para enviar la invitación',
    example: 'comprador@example.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
}
