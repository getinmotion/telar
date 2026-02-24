# Google OAuth 2.0 Implementation Guide

## 📋 Configuración Requerida

### 1. Variables de Entorno (.env)

Agrega estas variables a tu archivo `.env`:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3040/telar/server/auth/google/callback

# Sesión Passport (si no está configurado)
SESSION_SECRET=your_session_secret_here
```

### 2. Obtener Google OAuth Credentials

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la API de Google+ 
4. Ve a "Credenciales" → "Crear credenciales" → "ID de Cliente OAuth 2.0"
5. Selecciona "Aplicación web"
6. Agrega los siguientes URIs autorizados:
   - **Origen autorizado**: `http://localhost:3040` (desarrollo) o tu dominio de producción
   - **URI de redirección autorizado**: `http://localhost:3040/telar/server/auth/google/callback`

## 🔗 Endpoints Disponibles

### Google OAuth Flow

#### 1. Iniciar Autenticación con Google
```
GET /telar/server/auth/google
```

**Descripción**: Redirige al usuario a Google para autenticarse

**Respuesta**: Redirección HTTP 302 a Google OAuth Consent Screen

---

#### 2. Callback de Google
```
GET /telar/server/auth/google/callback
```

**Descripción**: Maneja la respuesta de Google y autentica al usuario

**Parámetros**: Automáticos (query params de Google, manejados por Passport)

**Respuesta (200 OK)**:
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "phone": null,
    "role": "user",
    "isSuperAdmin": false,
    "emailConfirmedAt": "2026-02-12T10:00:00.000Z",
    "lastSignInAt": "2026-02-12T15:30:00.000Z",
    "createdAt": "2026-02-12T10:00:00.000Z"
  },
  "userMasterContext": null,
  "artisanShop": null,
  "userMaturityActions": [],
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🚀 Ejemplo de Implementación en Frontend

### HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login con Google</title>
</head>
<body>
    <h1>Autenticación con Google OAuth 2.0</h1>
    
    <!-- Botón para iniciar Google OAuth -->
    <a href="http://localhost:3040/telar/server/auth/google" class="google-btn">
        Sign in with Google
    </a>

    <script>
        // El callback de Google redirigirá automáticamente aquí con el JWT en la respuesta
        // Puedes guardarlo en localStorage o sessionStorage
        
        // Si configuraste una página de redirección después del login:
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('access_token');
        
        if (token) {
            localStorage.setItem('access_token', token);
            window.location.href = '/dashboard';
        }
    </script>
</body>
</html>
```

### JavaScript/TypeScript (Recomendado)

```typescript
// authService.ts
class AuthService {
  private apiUrl = 'http://localhost:3040/telar/server';

  /**
   * Inicia el flujo de autenticación con Google
   */
  initiateGoogleLogin(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  /**
   * Guarda el token JWT después del callback
   */
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Obtiene el token JW guardado
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Valida si el token es válido
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${this.apiUrl}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cierra sesión (elimina el token)
   */
  logout(): void {
    localStorage.removeItem('access_token');
  }
}

export const authService = new AuthService();
```

### Uso en Componente React

```typescript
import { useEffect } from 'react';
import { authService } from './authService';

export function LoginPage() {
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    authService.validateToken().then((isValid) => {
      if (isValid) {
        window.location.href = '/dashboard';
      }
    });
  }, []);

  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}
```

---

## 🔐 Flujo Completo de Autenticación

```
1. Usuario hace clic en "Sign in with Google"
   ↓
2. Navegador redirige a: /auth/google
   ↓
3. GoogleAuthGuard activa → Passport maneja redirección a Google
   ↓
4. Usuario se autentica en Google
   ↓
5. Google redirige a: /auth/google/callback?code=...&state=...
   ↓
6. GoogleStrategy valida el código con Google
   ↓
7. Si el usuario NO existe:
   - Se crea nuevo usuario con email de Google
   - Se crea automáticamente su perfil y progreso
   - El email se marca como confirmado
   ↓
8. Si el usuario YA existe:
   - Se actualiza la información de Google si es necesario
   - Se actualiza lastSignInAt
   ↓
9. Se genera JWT token
   ↓
10. Se retorna al frontend:
    {
      user: { ... },
      access_token: "JWT_TOKEN",
      ...
    }
```

---

## 🛡️ Seguridad

### Consideraciones Importantes

1. **Variables de Entorno Seguras**:
   - Nunca commitees `GOOGLE_CLIENT_SECRET` al repositorio
   - Usa un archivo `.env.local` o variables de entorno del sistema

2. **CORS Configurado**:
   - CORS está habilitado en `main.ts`
   - En producción, especifica los orígenes permitidos

3. **Tokens JWT**:
   - El JWT tiene expiración de 4 horas
   - Usa `/auth/refresh` para obtener un nuevo token
   - Almacena el token de forma segura (localStorage, sessionStorage o cookies httpOnly)

4. **Sesión**:
   - Las sesiones están configuradas con:
     - `httpOnly: true` (no accesible desde JavaScript)
     - `sameSite: 'lax'` (protección CSRF)
     - `secure: true` en producción (solo HTTPS)

---

## 🧪 Testing

### cURL
```bash
# Iniciar Google Auth (redirigirá a Google)
curl -i http://localhost:3040/telar/server/auth/google

# Validar token JWT
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3040/telar/server/auth/validate
```

### Postman
1. Importa la colección desde Swagger: `http://localhost:3040/api/docs`
2. En el endpoint de Google Auth, sigue la redirección automática
3. Guarda el `access_token` de la respuesta
4. Úsalo en otros endpoints con la cabecera: `Authorization: Bearer {token}`

---

## ❓ Troubleshooting

### Error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor después de agregar las variables

### Error: "Redirect URI mismatch"
- Asegúrate de que `GOOGLE_CALLBACK_URL` coincida exactamente con lo registrado en Google Cloud Console
- Incluye el puerto: `http://localhost:3040/telar/server/auth/google/callback`

### Error: "Invalid scope"
- Los scopes actuales son: `email`, `profile`
- Si necesitas acceso a otros datos, modifica `google.strategy.ts`

### El callback no funciona
- Verifica que Passport esté correctamente inicializado en `main.ts`
- Asegúrate de que `express-session` está instalado
- Revisa los logs del servidor para más detalles

---

## 📝 Notas

- Los usuarios creados vía Google OAuth **no tienen contraseña**
- El email se marca automáticamente como verificado
- El perfil de usuario se crea automáticamente
- Si el usuario ya existe, se actualiza su `lastSignInAt`
- La misma arquitectura JWT se usa tanto para Google OAuth como para login tradicional

---

## 🔗 Referencias

- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Passport Documentation](https://docs.nestjs.com/recipes/passport)
