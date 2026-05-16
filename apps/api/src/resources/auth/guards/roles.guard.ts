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
 * 2. Verifica que el array roles[] del JWT contenga al menos uno de los roles requeridos.
 *    super_admin es un rol ordinario en ese array — no tiene tratamiento especial aquí.
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

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

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
