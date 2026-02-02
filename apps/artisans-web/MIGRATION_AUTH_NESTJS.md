# 🔐 Migración de Autenticación: Supabase → NestJS Backend

## 📋 Resumen

Se ha completado la migración del sistema de autenticación de **Supabase Auth** al **backend NestJS** manteniendo compatibilidad total con los 138 archivos existentes que usan `useAuth()`.

---

## ✅ Cambios Realizados

### 1. **Nuevos Archivos Creados**

#### `src/pages/auth/types/login.types.ts`
Interfaces TypeScript para el sistema de autenticación:
- `LoginPayload` - Datos para login (email, password)
- `AuthUser` - Estructura completa del usuario del backend
- `UserMetadata` - Metadatos del usuario
- `LoginSuccessResponse` - Respuesta exitosa del login
- `LoginErrorResponse` - Respuesta de error del login
- `GetProfileSuccessResponse` - Respuesta al obtener perfil
- `RefreshTokenSuccessResponse` - Respuesta al refrescar token
- `AuthErrorResponse` - Estructura genérica de errores 401

#### `src/pages/auth/actions/login.actions.ts`
Funciones para interactuar con el backend NestJS:
- `login(payload)` - Iniciar sesión y guardar token
- `getCurrentUser()` - Obtener perfil del usuario actual
- `refreshToken()` - Refrescar el access_token
- `logout()` - Limpiar tokens del localStorage
- `hasToken()` - Verificar si existe token
- `getToken()` - Obtener el token actual

#### `src/context/AuthContext.tsx` (Reemplazado)
Nuevo AuthContext que:
- ✅ Usa el backend NestJS para autenticación
- ✅ Mantiene la misma interfaz que el anterior (compatibilidad)
- ✅ Convierte `AuthUser` a `User` de Supabase para compatibilidad
- ✅ Valida el token automáticamente al cargar la app
- ✅ Refresca el token automáticamente cada 3.5 horas
- ✅ Maneja errores de token expirado
- ✅ Proporciona las mismas funciones: `user`, `session`, `loading`, `signIn`, `signOut`, etc.

---

### 2. **Archivos Modificados**

#### `src/pages/auth/Login.tsx`
- ✅ Migrado completamente al backend NestJS
- ✅ Ya no usa `signIn` de Supabase
- ✅ Llama directamente a `login()` de `login.actions.ts`
- ✅ Guarda el token JWT en `localStorage` como `telar_token`
- ✅ Guarda los datos del usuario en `localStorage` como `telar_user`
- ✅ Maneja errores específicos del backend (401, credenciales inválidas)
- ✅ Muestra estado de carga durante el proceso

#### `src/pages/auth/Register.tsx`
- ⚠️ **Pendiente**: Actualmente solo registra pero no guarda el token
- 📝 **Nota**: El backend debe devolver `access_token` en la respuesta de registro para completar la migración

#### `src/pages/auth/VerifyEmail.tsx`
- ✅ Migrado al backend NestJS
- ✅ Usa el endpoint `/telar/server/email-verifications/verify/:token`
- ✅ Maneja respuestas de éxito y error del nuevo backend

---

### 3. **Archivos de Respaldo**

#### `src/context/AuthContext.supabase.backup.tsx`
- Backup del AuthContext original basado en Supabase
- Mantener por si se necesita revertir cambios

---

## 🔑 Sistema de Tokens

### Almacenamiento en localStorage

```typescript
// Token JWT del backend NestJS
localStorage.setItem('telar_token', access_token);

// Datos completos del usuario
localStorage.setItem('telar_user', JSON.stringify(authUser));
```

### Interceptor Automático

El cliente `telarApi` (en `src/integrations/api/telarApi.ts`) tiene un interceptor que:
1. Lee `telar_token` del localStorage
2. Lo agrega automáticamente a todas las peticiones: `Authorization: Bearer {token}`

```typescript
telarApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('telar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🔄 Flujo de Autenticación

### 1. **Login**
```
Usuario → Login.tsx → login() → Backend NestJS
                                    ↓
                          Respuesta con access_token
                                    ↓
                    Guardar en localStorage (telar_token, telar_user)
                                    ↓
                              Redirigir a dashboard
```

### 2. **Validación al Cargar la App**
```
App carga → AuthContext.useEffect → ¿Existe telar_token?
                                            ↓ Sí
                                    getCurrentUser()
                                            ↓
                                    ¿Token válido?
                                    ↓ Sí        ↓ No
                            Autenticar    Intentar refreshToken()
                                                ↓ Falla
                                            Limpiar y logout
```

### 3. **Refresh Automático**
```
Cada 3.5 horas → refreshToken() → Backend NestJS
                                        ↓
                              Nuevo access_token
                                        ↓
                        Actualizar localStorage
```

---

## 🌐 Endpoints del Backend NestJS

### 1. **Login**
```http
POST /telar/server/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "role": "user",
    "rawUserMetaData": {
      "full_name": "...",
      "first_name": "...",
      "last_name": "..."
    },
    ...
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **Obtener Perfil**
```http
GET /telar/server/auth/profile
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "id": "...",
  "email": "...",
  "role": "user",
  "emailConfirmedAt": "...",
  "lastSignInAt": "...",
  "rawUserMetaData": { ... },
  ...
}
```

### 3. **Refresh Token**
```http
POST /telar/server/auth/refresh
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. **Registro**
```http
POST /telar/server/auth/register
Content-Type: application/json

{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "password": "...",
  "passwordConfirmation": "...",
  "whatsapp": "...",
  "department": "...",
  "city": "...",
  "hasRUT": true,
  "rut": "...",
  "acceptTerms": true,
  "newsletterOptIn": false
}
```

### 5. **Verificar Email**
```http
POST /telar/server/email-verifications/verify/:token
```

---

## 🔒 Compatibilidad con Código Existente

### useAuth() Hook

El nuevo `AuthContext` mantiene la misma interfaz que el anterior:

```typescript
const { user, session, loading, isAuthorized, signIn, signOut } = useAuth();

// ✅ user - Objeto User compatible con Supabase
// ✅ session - Sesión mock compatible con Supabase
// ✅ loading - Estado de carga
// ✅ isAuthorized - Si el usuario es admin
// ✅ signIn - Función de login (deprecated, usar login.actions.ts)
// ✅ signOut - Función de logout
```

### Conversión de Tipos

El `AuthContext` convierte automáticamente:
- `AuthUser` (NestJS) → `User` (Supabase)
- Crea una `Session` mock para compatibilidad

Esto permite que los **138 archivos** que usan `useAuth()` sigan funcionando sin cambios.

---

## ⚠️ Consideraciones Importantes

### 1. **Supabase todavía se usa para:**
- Consultas a la base de datos (tablas de Supabase)
- Funciones RPC (como `is_admin`)
- Edge Functions (algunas todavía activas)

### 2. **Migración Gradual**
- ✅ Login migrado a NestJS
- ✅ Verificación de email migrada a NestJS
- ⚠️ Registro parcialmente migrado (falta guardar token)
- ❌ Otras funcionalidades todavía usan Supabase

### 3. **Token JWT**
- Expira en 4 horas (14400 segundos)
- Se refresca automáticamente cada 3.5 horas
- Si falla el refresh, se cierra la sesión automáticamente

---

## 🧪 Testing

### Probar Login
1. Ir a `/login`
2. Ingresar credenciales válidas
3. Verificar que se guarda `telar_token` en localStorage
4. Verificar que se guarda `telar_user` en localStorage
5. Verificar redirección al dashboard

### Probar Refresh Automático
1. Hacer login
2. Esperar 3.5 horas (o modificar el intervalo temporalmente)
3. Verificar en consola: "🔄 Refrescando token automáticamente..."
4. Verificar que se actualiza `telar_token` en localStorage

### Probar Token Expirado
1. Hacer login
2. Modificar manualmente `telar_token` en localStorage (token inválido)
3. Recargar la página
4. Verificar que intenta refresh y luego cierra sesión

---

## 📝 Próximos Pasos

### 1. **Completar Migración de Register**
Modificar `Register.tsx` para que:
- El backend devuelva `access_token` en la respuesta
- Guardar el token después del registro exitoso
- Autenticar automáticamente al usuario

### 2. **Migrar Otras Funcionalidades**
- Recuperación de contraseña
- Cambio de contraseña
- Actualización de perfil

### 3. **Optimizaciones**
- Implementar refresh token (si el backend lo soporta)
- Mejorar manejo de errores de red
- Agregar retry logic para peticiones fallidas

---

## 🐛 Troubleshooting

### "Token no proporcionado"
**Causa:** El token no está en localStorage o el interceptor no lo está agregando.
**Solución:** Verificar que `telar_token` existe en localStorage.

### "Token inválido o expirado"
**Causa:** El token JWT ha expirado o es inválido.
**Solución:** El sistema intentará refrescar automáticamente. Si falla, el usuario debe hacer login nuevamente.

### "Usuario no autenticado después de login"
**Causa:** El token no se guardó correctamente o hubo un error en `getCurrentUser()`.
**Solución:** Verificar la consola del navegador para ver logs de error.

---

## 📚 Archivos Clave

```
src/
├── context/
│   ├── AuthContext.tsx                    # ✅ Nuevo (NestJS)
│   └── AuthContext.supabase.backup.tsx    # 📦 Backup (Supabase)
├── pages/auth/
│   ├── Login.tsx                          # ✅ Migrado
│   ├── Register.tsx                       # ⚠️ Parcial
│   ├── VerifyEmail.tsx                    # ✅ Migrado
│   ├── types/
│   │   ├── login.types.ts                 # ✅ Nuevo
│   │   └── register.types.ts              # ✅ Existente
│   └── actions/
│       ├── login.actions.ts               # ✅ Nuevo
│       └── register.actions.ts            # ✅ Existente
└── integrations/api/
    └── telarApi.ts                        # ✅ Interceptor configurado
```

---

## ✨ Beneficios de la Migración

1. ✅ **Control Total**: Backend propio en lugar de depender de Supabase Auth
2. ✅ **Flexibilidad**: Puedes personalizar la lógica de autenticación
3. ✅ **Compatibilidad**: Mantiene funcionando los 138 archivos existentes
4. ✅ **Seguridad**: Tokens JWT con expiración y refresh automático
5. ✅ **Escalabilidad**: Preparado para agregar más funcionalidades

---

**Fecha de Migración:** 19 de Enero, 2026  
**Versión:** 1.0  
**Estado:** ✅ Completado (Login y VerifyEmail)

