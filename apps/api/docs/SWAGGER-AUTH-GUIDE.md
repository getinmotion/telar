# Guía de Autenticación en Swagger

## ✅ **Problema Resuelto**

Se corrigió la inconsistencia en los nombres de referencia de `@ApiBearerAuth()`. Todos los endpoints protegidos ahora usan correctamente `'access-token'`, que coincide con la configuración en `main.ts`.

## 🔐 **Cómo Usar la Autenticación JWT en Swagger**

### **Paso 1: Obtener el Token de Acceso**

1. Abre Swagger en tu navegador:
   ```
   http://localhost:3040/api/docs
   ```

2. Ve a la sección **auth** y expande el endpoint `POST /auth/login`

3. Haz clic en "Try it out"

4. Ingresa las credenciales de prueba:
   ```json
   {
     "email": "user@example.com",
     "password": "tu-password"
   }
   ```

5. Ejecuta la petición y **copia el token** de la respuesta:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

### **Paso 2: Autorizar en Swagger**

1. Busca el botón **"Authorize"** 🔓 en la parte superior derecha de Swagger

2. Haz clic en él

3. En el campo de **access-token**, pega tu token JWT:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   ⚠️ **IMPORTANTE**: 
   - **NO agregues** el prefijo `Bearer` 
   - Solo pega el token directamente
   - Swagger agregará automáticamente el prefijo `Bearer` al hacer las peticiones

4. Haz clic en **"Authorize"**

5. Haz clic en **"Close"**

### **Paso 3: Probar Endpoints Protegidos**

Ahora puedes probar cualquier endpoint que tenga el candado 🔒:

- `GET /auth/profile`
- `POST /auth/refresh`
- `POST /auth/change-password`
- `GET /auth/validate`
- Todos los endpoints de `ai`, `user-profiles`, etc.

## 🔍 **Verificación**

Para verificar que el token funciona:

1. Ve a `GET /auth/validate`
2. Haz clic en "Try it out"
3. Ejecuta
4. Deberías recibir:
   ```json
   {
     "valid": true,
     "user": {
       "id": "...",
       "email": "...",
       "role": "..."
     }
   }
   ```

## ⚠️ **Errores Comunes**

### Error: "Token inválido o expirado"

**Causa**: El token expiró (duración: 4 horas)

**Solución**: 
1. Haz logout
2. Haz login nuevamente para obtener un token nuevo
3. Vuelve a autorizar en Swagger

### Error: "Token no proporcionado"

**Causa**: No has autorizado en Swagger o el token no se guardó correctamente

**Solución**:
1. Verifica que hiciste clic en el botón "Authorize" 🔓
2. Verifica que pegaste el token completo
3. Verifica que hiciste clic en "Authorize" (el botón verde)
4. Cierra el modal y prueba de nuevo

### Error: "No autorizado"

**Causa**: El token es inválido o fue modificado

**Solución**:
1. Obtén un token nuevo haciendo login
2. Copia el token **completo** (puede ser muy largo)
3. Pégalo en el campo de autorización

## 📝 **Notas Técnicas**

### Configuración Actual

**En `main.ts`:**
```typescript
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Ingresa tu token JWT',
    in: 'header',
  },
  'access-token', // <- Nombre de referencia
)
```

**En los controllers:**
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token') // <- Debe coincidir
```

### Token JWT

- **Duración**: 4 horas
- **Secret**: Configurado en `.env` como `PASSWORD_SECRET`
- **Formato**: `Bearer {token}` (Swagger lo agrega automáticamente)
- **Payload**: 
  ```json
  {
    "sub": "user-id",
    "email": "user@example.com",
    "role": "user|admin",
    "isSuperAdmin": false
  }
  ```

## 🎯 **Endpoints Públicos (No Requieren Token)**

Estos endpoints NO requieren autenticación:

- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/request-password-recovery` - Solicitar recuperación
- `POST /auth/reset-password` - Restablecer contraseña
- `POST /ai/extract-business-info` - Extracción de información

## 🔒 **Endpoints Protegidos (Requieren Token)**

Todos los demás endpoints requieren token JWT:

- **auth**: profile, refresh, change-password, validate
- **ai**: shop-suggestions, product-suggestions
- **user-profiles**: Todos
- **artisan-shops**: Todos
- **products**: Todos
- Y más...

---

**Última actualización**: 2026-01-23
