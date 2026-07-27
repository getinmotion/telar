import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsersPassportDto {
  @ApiProperty({
    description: 'Número de identificación del comprador',
    example: '1234567890',
    maxLength: 50,
  })
  @IsString({ message: 'El número de identificación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de identificación es obligatorio' })
  @MaxLength(50, {
    message: 'El número de identificación no puede exceder 50 caracteres',
  })
  numIdentificacion: string;

  @ApiProperty({
    description: 'Nombre completo del comprador',
    example: 'Juan Pérez García',
    maxLength: 255,
  })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(255, {
    message: 'El nombre completo no puede exceder 255 caracteres',
  })
  @MinLength(3, {
    message: 'El nombre completo debe tener al menos 3 caracteres',
  })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Correo electrónico del comprador',
    example: 'juan.perez@example.com',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @MaxLength(255, {
    message: 'El correo electrónico no puede exceder 255 caracteres',
  })
  email: string;

  @ApiProperty({
    description: 'Teléfono del comprador',
    example: '+57 300 1234567',
    maxLength: 50,
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(50, {
    message: 'El teléfono no puede exceder 50 caracteres',
  })
  telefono: string;
}
