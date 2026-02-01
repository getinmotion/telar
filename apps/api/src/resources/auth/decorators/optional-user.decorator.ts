import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Decorador para extraer usuario del JWT de manera opcional
 * Si el token existe y es válido, retorna el payload del usuario
 * Si no hay token o es inválido, retorna null (no lanza error)
 */
export const OptionalUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    try {
      const [type, token] = authHeader.split(' ');
      
      if (type !== 'Bearer' || !token) {
        return null;
      }

      // Inyectar JwtService manualmente
      const jwtService = new JwtService({
        secret: process.env.PASSWORD_SECRET,
      });

      const payload = jwtService.verify(token);
      return payload;
    } catch (error) {
      // Si el token es inválido, simplemente retornar null
      return null;
    }
  },
);
