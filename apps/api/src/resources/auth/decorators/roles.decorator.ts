import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator para requerir roles específicos en un endpoint.
 * Usar junto con RolesGuard y JwtAuthGuard.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('super_admin')
 * @Delete(':id')
 * remove() { ... }
 *
 * @example – múltiples roles aceptados
 * @Roles('admin', 'moderator')
 * @Get()
 * findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
