import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole } from '../enums/app-role.enum';

/**
 * DTO de respuesta para un rol de usuario
 */
export class UserRoleResponseDto {
  @ApiProperty({
    description: 'ID del rol de usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Rol asignado',
    enum: AppRole,
    example: AppRole.ARTISAN,
  })
  role: AppRole;

  @ApiProperty({
    description: 'Fecha en que se otorgó el rol',
    example: '2026-02-22T10:00:00.000Z',
  })
  grantedAt: Date;

  @ApiPropertyOptional({
    description: 'ID del usuario que otorgó el rol',
    example: '123e4567-e89b-12d3-a456-426614174002',
    nullable: true,
  })
  grantedBy: string | null;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-02-22T10:00:00.000Z',
  })
  createdAt: Date;
}
