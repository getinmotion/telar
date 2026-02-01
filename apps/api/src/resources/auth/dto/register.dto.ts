import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 2,
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @ApiProperty({
    description:
      'Contraseña del usuario (mínimo 8 caracteres, debe contener mayúscula, minúscula, número y carácter especial)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmación de la contraseña',
    example: 'Password123!',
  })
  @IsString({ message: 'La confirmación de contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria' })
  passwordConfirmation: string;

  @ApiProperty({
    description: 'WhatsApp del usuario (formato: +57 seguido de 10 dígitos)',
    example: '+573001234567',
  })
  @IsString({ message: 'El WhatsApp debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El WhatsApp es obligatorio' })
  @Matches(/^\+57\d{10}$/, {
    message: 'WhatsApp debe tener formato +57 seguido de 10 dígitos',
  })
  whatsapp: string;

  @ApiProperty({
    description: 'Departamento del usuario',
    example: 'Cundinamarca',
  })
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El departamento es obligatorio' })
  department: string;

  @ApiProperty({
    description: 'Ciudad del usuario',
    example: 'Bogotá',
  })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @ApiProperty({
    description: '¿El usuario tiene RUT?',
    example: true,
  })
  @IsBoolean({ message: 'hasRUT debe ser un valor booleano' })
  @IsNotEmpty({ message: 'Debes indicar si tienes RUT' })
  hasRUT: boolean;

  @ApiPropertyOptional({
    description: 'RUT del usuario (requerido si hasRUT es true)',
    example: '123456789-0',
  })
  @ValidateIf((o) => o.hasRUT === true)
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es obligatorio si indicaste que lo tienes' })
  rut?: string;

  @ApiProperty({
    description: 'Aceptación de términos y condiciones',
    example: true,
  })
  @IsBoolean({ message: 'acceptTerms debe ser un valor booleano' })
  @IsNotEmpty({ message: 'Debes aceptar los términos y condiciones' })
  acceptTerms: boolean;

  @ApiPropertyOptional({
    description: 'Suscripción al newsletter',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'newsletterOptIn debe ser un valor booleano' })
  newsletterOptIn?: boolean;
}
