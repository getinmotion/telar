import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType, AccountType } from '../entities/user-profile.entity';

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
    description: 'Tipo de negocio',
    example: 'Artesanía',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de negocio debe ser una cadena de texto' })
  businessType?: string;

  @ApiPropertyOptional({
    description: 'Mercado objetivo',
    example: 'Turistas y coleccionistas',
  })
  @IsOptional()
  @IsString({ message: 'El mercado objetivo debe ser una cadena de texto' })
  targetMarket?: string;

  @ApiPropertyOptional({
    description: 'Etapa actual',
    example: 'Crecimiento',
  })
  @IsOptional()
  @IsString({ message: 'La etapa actual debe ser una cadena de texto' })
  currentStage?: string;

  @ApiPropertyOptional({
    description: 'Objetivos del negocio',
    example: ['Expandir mercado', 'Aumentar ventas'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los objetivos deben ser un array' })
  @IsString({ each: true, message: 'Cada objetivo debe ser una cadena de texto' })
  businessGoals?: string[];

  @ApiPropertyOptional({
    description: 'Meta de ingresos mensuales',
    example: 5000000,
  })
  @IsOptional()
  @IsInt({ message: 'La meta de ingresos debe ser un número entero' })
  monthlyRevenueGoal?: number;

  @ApiPropertyOptional({
    description: 'Disponibilidad de tiempo',
    example: 'Tiempo completo',
  })
  @IsOptional()
  @IsString({ message: 'La disponibilidad debe ser una cadena de texto' })
  timeAvailability?: string;

  @ApiPropertyOptional({
    description: 'Tamaño del equipo',
    example: '1-5 personas',
  })
  @IsOptional()
  @IsString({ message: 'El tamaño del equipo debe ser una cadena de texto' })
  teamSize?: string;

  @ApiPropertyOptional({
    description: 'Desafíos actuales',
    example: ['Falta de capital', 'Marketing digital'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los desafíos deben ser un array' })
  @IsString({ each: true, message: 'Cada desafío debe ser una cadena de texto' })
  currentChallenges?: string[];

  @ApiPropertyOptional({
    description: 'Canales de venta',
    example: ['Tienda física', 'Instagram', 'WhatsApp'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los canales de venta deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada canal de venta debe ser una cadena de texto',
  })
  salesChannels?: string[];

  @ApiPropertyOptional({
    description: 'Presencia en redes sociales (JSON)',
    example: { instagram: '@mitienda', facebook: 'MiTienda' },
  })
  @IsOptional()
  @IsObject({ message: 'La presencia en redes sociales debe ser un objeto' })
  socialMediaPresence?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Ubicación del negocio',
    example: 'Bogotá, Colombia',
  })
  @IsOptional()
  @IsString({ message: 'La ubicación debe ser una cadena de texto' })
  businessLocation?: string;

  @ApiPropertyOptional({
    description: 'Años en el negocio',
    example: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Los años en el negocio deben ser un número entero' })
  yearsInBusiness?: number;

  @ApiPropertyOptional({
    description: 'Rango de inversión inicial',
    example: '$1M - $5M',
  })
  @IsOptional()
  @IsString({ message: 'El rango de inversión debe ser una cadena de texto' })
  initialInvestmentRange?: string;

  @ApiPropertyOptional({
    description: 'Habilidades principales',
    example: ['Tejido', 'Diseño', 'Marketing'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las habilidades deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada habilidad debe ser una cadena de texto',
  })
  primarySkills?: string[];

  @ApiPropertyOptional({
    description: 'Preferencia de idioma',
    example: 'es',
    default: 'es',
  })
  @IsOptional()
  @IsString({ message: 'La preferencia de idioma debe ser una cadena de texto' })
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
    description: 'Número de WhatsApp en formato E.164',
    example: '+573001234567',
  })
  @IsOptional()
  @IsString({ message: 'El número de WhatsApp debe ser una cadena de texto' })
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'El número de WhatsApp debe estar en formato E.164 (ej: +573001234567)',
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
}

