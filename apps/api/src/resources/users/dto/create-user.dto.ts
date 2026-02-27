import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
  IsBoolean,
  Matches,
  IsUUID,
  IsDate,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255, { message: 'La contraseña no puede exceder 255 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'El teléfono debe tener un formato válido (ej: +1234567890)',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El rol no puede exceder 255 caracteres' })
  role?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El instance_id debe ser un UUID válido' })
  instanceId?: string;

  @IsOptional()
  @IsBoolean({ message: 'isSsoUser debe ser un valor booleano' })
  isSsoUser?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isAnonymous debe ser un valor booleano' })
  isAnonymous?: boolean;

  @IsOptional()
  rawUserMetaData?: Record<string, any>;

  @IsOptional()
  rawAppMetaData?: Record<string, any>;

  @IsOptional()
  @IsDate({ message: 'emailConfirmedAt debe ser una fecha válida' })
  emailConfirmedAt?: Date;
}