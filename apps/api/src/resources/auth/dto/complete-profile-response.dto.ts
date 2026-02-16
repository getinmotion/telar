import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para el perfil completo del usuario
 * Incluye: user, userMasterContext, artisanShop, userMaturityActions, access_token
 */
export class CompleteProfileResponseDto {
  @ApiProperty({
    description: 'Información del usuario (sin contraseña)',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      phone: '+573001234567',
      role: 'user',
      isSuperAdmin: false,
      emailConfirmedAt: '2026-01-14T10:00:00.000Z',
      lastSignInAt: '2026-02-14T15:30:00.000Z',
      createdAt: '2026-01-14T10:00:00.000Z',
    },
  })
  user: any;

  @ApiPropertyOptional({
    description: 'Contexto maestro del usuario para IA (puede ser null)',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      languagePreference: 'es',
      businessContext: { industry: 'Artesanía', size: 'small' },
      goalsAndObjectives: { goal: 'Expandir ventas online' },
      businessProfile: { products: ['Cerámica', 'Textiles'] },
      contextVersion: 1,
      lastAssessmentDate: '2026-01-14T10:00:00.000Z',
    },
  })
  userMasterContext: any | null;

  @ApiPropertyOptional({
    description: 'Tienda del artesano (puede ser null si no tiene tienda)',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      shopName: 'Artesanías Don Pedro',
      shopSlug: 'artesanias-don-pedro',
      department: 'Cundinamarca',
      municipality: 'Bogotá',
      active: true,
      featured: false,
    },
  })
  artisanShop: any | null;

  @ApiProperty({
    description: 'Array de acciones de madurez empresarial del usuario',
    type: 'array',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        actionType: 'profile_completion',
        category: 'digital_presence',
        description: 'Completó su perfil de artesano',
        points: 10,
        createdAt: '2026-01-14T10:00:00.000Z',
      },
    ],
  })
  userMaturityActions: any[];

  @ApiProperty({
    description: 'Token JWT de acceso (refreshed)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}
