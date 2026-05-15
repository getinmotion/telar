import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard centralizado para control de acceso basado en roles.
 *
 * Debe usarse DESPUÉS de JwtAuthGuard (que hidrata req.user desde el JWT).
 *
 * Lógica de acceso:
 * 1. Si el endpoint no tiene @Roles(), permite el acceso (guard no-op).
 * 2. Si el usuario tiene isSuperAdmin === true, siempre permite el acceso.
 * 3. Si los roles requeridos incluyen 'super_admin', solo se permite si isSuperAdmin === true.
 * 4. De lo contrario, verifica que el array roles[] del JWT contenga al menos
 *    uno de los roles requeridos.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('super_admin')
 * @Delete(':id')
 * remove() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin @Roles() → acceso libre (el JwtAuthGuard ya verificó autenticación)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Super-admin siempre tiene acceso total
    if (user.isSuperAdmin === true) {
      return true;
    }

    // Rol especial 'super_admin' — solo para isSuperAdmin (ya verificado arriba)
    if (requiredRoles.includes('super_admin')) {
      throw new ForbiddenException('Se requiere rol super_admin');
    }

    // Verificar contra el array de roles en el JWT
    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
