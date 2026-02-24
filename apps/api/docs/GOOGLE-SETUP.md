# 🔧 Google Cloud Console - Configuración Paso a Paso

## 1️⃣ Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el proyecto actual (esquina superior izquierda)
3. Haz clic en **"Nuevo Proyecto"**
4. Ingresa el nombre: `Telar` (o el que prefieras)
5. Haz clic en **"Crear"**
6. Espera a que se cree el proyecto (puede tomar algunos segundos)

---

## 2️⃣ Habilitar Google+ API

1. En el menú, ve a **APIs y servicios** → **Biblioteca**
2. Busca `Google+ API` 
3. Haz clic en el resultado
4. Haz clic en el botón azul **"Habilitar"**
5. Espera a que se habilite la API (unos segundos)

---

## 3️⃣ Crear Credenciales OAuth 2.0

### Pantalla de consentimiento (OAuth consent screen)

1. Ve a **APIs y servicios** → **Pantalla de consentimiento OAuth**
2. Selecciona el tipo de usuario: **Externo** (para aplicaciones públicas)
3. Haz clic en **"Crear"**
4. Completa los datos:
   - **Nombre de la aplicación**: `Telar`
   - **Email de soporte**: tu email
   - **Información de contacto del desarrollador**: tu email
5. Haz clic en **"Guardar"**

### Crear credenciales OAuth

1. Ve a **APIs y servicios** → **Credenciales**
2. Haz clic en **"+ Crear credenciales"** → **ID de cliente OAuth 2.0**
3. Selecciona **"Aplicación web"**
4. Completa:
   - **Nombre**: `Telar Web`
   - **Orígenes de JavaScript autorizados**:
     - `http://localhost:3040`
     - `http://localhost:3000`
     - `https://tudominio.com` (después en producción)
   - **URIs de redirección autorizados**:
     - `http://localhost:3040/telar/server/auth/google/callback`
     - `https://tudominio.com/telar/server/auth/google/callback` (en producción)
5. Haz clic en **"Crear"**

---

## 4️⃣ Copiar Credenciales

Se abrirá una ventana con:
- **Client ID**
- **Client Secret**

📝 **COPIA ESTOS VALORES** (no los compartas públicamente)

---

## 5️⃣ Configurar en tu Proyecto

### Opción A: Archivo .env.local (Desarrollo)

```bash
# Crea archivo .env.local en la raíz del proyecto
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3040/telar/server/auth/google/callback
SESSION_SECRET=your-random-secret-key-here
```

### Opción B: Variables de Entorno del Sistema

**Windows:**
```powershell
# PowerShell (como Admin)
[Environment]::SetEnvironmentVariable("GOOGLE_CLIENT_ID", "your_client_id", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_CLIENT_SECRET", "your_client_secret", "User")
```

**Linux/Mac:**
```bash
# Agregar a ~/.bashrc o ~/.zshrc
export GOOGLE_CLIENT_ID=your_client_id
export GOOGLE_CLIENT_SECRET=your_client_secret
export GOOGLE_CALLBACK_URL=http://localhost:3040/telar/server/auth/google/callback
export SESSION_SECRET=your-random-secret-key
```

### Opción C: Docker / Producción

En tu `docker-compose.yml`:
```yaml
environment:
  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
  GOOGLE_CALLBACK_URL: https://api.tudominio.com/telar/server/auth/google/callback
  SESSION_SECRET: ${SESSION_SECRET}
```

---

## 6️⃣ Verificar Configuración

Reinicia tu servidor:

```bash
cd c:/Users/User/Documents/proyectos/telar/apps/api
npm run start:dev
```

Si ves:
```
🚝 Servidor ejecutandose en el Puerto: 3040
```

✅ **¡Google OAuth está configurado!**

---

## 🧪 Test Rápido

1. Abre un navegador en: `http://localhost:3040/telar/server/auth/google`
2. Deberías ser redirigido a Google
3. Selecciona tu cuenta de Google
4. Autoriza la aplicación
5. Serás redirigido con el token JWT ✨

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Redirect URI mismatch"
- **Causa**: El callback URL no coincide exactamente
- **Solución**: Verifica que sea exactamente igual:
  - En Google Console: `http://localhost:3040/telar/server/auth/google/callback`
  - En `.env`: `GOOGLE_CALLBACK_URL=http://localhost:3040/telar/server/auth/google/callback`

### Error: "Invalid Client ID"
- **Causa**: Client ID mal configurado o expirado
- **Solución**: 
  - Copia el Client ID nuevamente de Google Console
  - Verifica que no tenga espacios extras

### Error: "Client secret does not match"
- **Causa**: Client Secret incorrecto
- **Solución**: Copia el Client Secret nuevamente sin espacios

### Blank page en callback
- **Causa**: El servidor no está procesando la redirección
- **Solución**: Verifica en la consola:
  ```bash
  npm run start:dev
  ```
  y busca mensajes de error

### CORS Error
- **Causa**: Origen no autorizado
- **Solución**: Agrega tu dominio a "Orígenes de JavaScript autorizados":
  - Ve a Google Cloud Console → Credenciales
  - Edita el ID de cliente
  - Agrega tu dominio

---

## 🔐 Mejores Prácticas

✅ **DO:**
- Mantener `CLIENT_SECRET` privado en `.env.local`
- No commitear `.env` al repositorio
- Usar variables de entorno en producción
- Rotar credenciales regularmente

❌ **DON'T:**
- Hardcodear credenciales en el código
- Compartir `CLIENT_SECRET` en repositorios públicos
- Usar la misma credencial de desarrollo en producción
- Publicar screenshots con credenciales

---

## 📋 Checklist de Configuración

- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar Google+ API
- [ ] Configurar pantalla de consentimiento OAuth
- [ ] Crear credenciales OAuth 2.0
- [ ] Copiar Client ID y Client Secret
- [ ] Configurar `.env.local`
- [ ] Agregar URLs autorizadas en Google Console
- [ ] Reiniciar servidor
- [ ] Probar flujo completo
- [ ] Actualizar URLs en producción

---

## 🚀 Pasar a Producción

Cuando estés listo para producción:

1. **Crear nueva credencial en Google Console** para el dominio de producción
2. **Actualizar variables de entorno**:
   ```env
   GOOGLE_CLIENT_ID=production_client_id
   GOOGLE_CLIENT_SECRET=production_client_secret
   GOOGLE_CALLBACK_URL=https://api.tudominio.com/telar/server/auth/google/callback
   ```
3. **Agregar URLs autorizadas**:
   - Origen: `https://tudominio.com`
   - URI de redirección: `https://api.tudominio.com/telar/server/auth/google/callback`
4. **Testear completamente** antes del despliegue
5. **Monitorear logs** después del despliegue

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que las URLs coinciden exactamente
3. Confirma que las variables de entorno están correctamente configuradas
4. Lee [GOOGLE-OAUTH-GUIDE.md](./GOOGLE-OAUTH-GUIDE.md) para más detalles

¡Listo para autenticar usuarios con Google! 🎉
