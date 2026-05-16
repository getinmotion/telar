/**
 * Utilidades para JWT en el cliente.
 *
 * NOTA: estas funciones DECODIFICAN el JWT (base64) pero NO lo verifican.
 * La verificación real ocurre en el backend NestJS.
 * En el frontend solo necesitamos leer los datos del payload para la UI.
 */

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  isSuperAdmin?: boolean;
  roles?: string[];
  exp?: number;
  iat?: number;
}

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Retorna null si el token está mal formado.
 */
export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Verifica si un JWT ha expirado (según el campo `exp`).
 * Retorna true si expiró o si no se puede decodificar.
 */
export function isJwtExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
}
