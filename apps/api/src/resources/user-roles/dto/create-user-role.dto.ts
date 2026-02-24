import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole } from '../enums/app-role.enum';

/**
 * DTO para crear un rol de usuario
 */
export class CreateUserRoleDto {
  @ApiProperty({
    description: 'ID del usuario al que se le asignará el rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Rol a asignar',
    enum: AppRole,
    example: AppRole.ARTISAN,
  })
  @IsEnum(AppRole)
  role: AppRole;

  @ApiPropertyOptional({
    description: 'ID del usuario que otorga el rol (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  grantedBy?: string;
}
