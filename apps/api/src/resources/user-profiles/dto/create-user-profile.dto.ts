import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserType,
  AccountType,
  IdType,
  Gender,
} from '../entities/user-profile.entity';

export class CreateUserProfileDto {
  @ApiProperty({
    description: 'ID del usuario (relación con auth.users)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'URL del avatar',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser una cadena de texto' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Descripción del negocio',
    example: 'Artesanías en cuero hechas a mano',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la marca',
    example: 'Cueros Don Juan',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la marca debe ser una cadena de texto' })
  brandName?: string;

  @ApiPropertyOptional({
    description: 'Preferencia de idioma',
    example: 'es',
    default: 'es',
  })
  @IsOptional()
  @IsString({
    message: 'La preferencia de idioma debe ser una cadena de texto',
  })
  @MaxLength(10, {
    message: 'La preferencia de idioma no puede exceder 10 caracteres',
  })
  languagePreference?: string;

  @ApiPropertyOptional({
    description: 'Tipo de usuario',
    enum: UserType,
    default: UserType.REGULAR,
  })
  @IsOptional()
  @IsEnum(UserType, { message: 'El tipo de usuario no es válido' })
  userType?: UserType;

  @ApiPropertyOptional({
    description: 'Primer nombre',
    example: 'Juan',
  })
  @IsOptional()
  @IsString({ message: 'El primer nombre debe ser una cadena de texto' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Tipo de identificación',
    enum: IdType,
    example: IdType.CC,
  })
  @IsOptional()
  @IsEnum(IdType, { message: 'El tipo de identificación no es válido' })
  idType?: IdType;

  @ApiPropertyOptional({
    description: 'Número de identificación',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'El número de identificación debe ser una cadena de texto' })
  idNumber?: string;

  @ApiPropertyOptional({
    description: 'Género',
    enum: Gender,
    example: Gender.M,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'El género no es válido' })
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Número de WhatsApp en formato E.164',
    example: '+573001234567',
  })
  @IsOptional()
  @IsString({ message: 'El número de WhatsApp debe ser una cadena de texto' })
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'El número de WhatsApp debe estar en formato E.164 (ej: +573001234567)',
  })
  whatsappE164?: string;

  @ApiPropertyOptional({
    description: 'Departamento',
    example: 'Cundinamarca',
  })
  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  department?: string;

  @ApiPropertyOptional({
    description: 'Ciudad',
    example: 'Bogotá',
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  city?: string;

  @ApiPropertyOptional({
    description: 'RUT (Registro Único Tributario)',
    example: '1234567890-1',
  })
  @IsOptional()
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  rut?: string;

  @ApiPropertyOptional({
    description: 'RUT pendiente',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'rutPendiente debe ser un valor booleano' })
  rutPendiente?: boolean;

  @ApiPropertyOptional({
    description: 'Suscripción a newsletter',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'newsletterOptIn debe ser un valor booleano' })
  newsletterOptIn?: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de cuenta',
    enum: AccountType,
    default: AccountType.SELLER,
  })
  @IsOptional()
  @IsEnum(AccountType, { message: 'El tipo de cuenta no es válido' })
  accountType?: AccountType;

  @ApiPropertyOptional({
    description: 'Código DANE de la ciudad',
    example: 11001,
  })
  @IsOptional()
  @IsInt({ message: 'El código DANE debe ser un número entero' })
  daneCity?: number;

  @ApiPropertyOptional({
    description: 'ID del país',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El countryId debe ser un UUID válido' })
  countryId?: string;

  @ApiPropertyOptional({
    description: 'ID del acuerdo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El agreementId debe ser un UUID válido' })
  agreementId?: string;

  @ApiPropertyOptional({
    description: 'ID del origen artesanal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El artisanOriginId debe ser un UUID válido' })
  artisanOriginId?: string;
}
