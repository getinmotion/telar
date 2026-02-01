# Servicio de Email - GetInMotion Server

## Descripción

Módulo de envío de correos electrónicos usando `@nestjs-modules/mailer` con templates Handlebars y soporte SMTP.

## Configuración

### Variables de Entorno

Agrega estas variables en tu archivo `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Sender Configuration
MAIL_FROM_NAME=GetInMotion
MAIL_FROM_EMAIL=noreply@getinmotion.com

# Frontend URL (para los enlaces en los emails)
FRONTEND_URL=http://localhost:3000
```

**⚠️ Nota importante sobre `SMTP_SECURE`:**
- Ya no es necesario configurar `SMTP_SECURE`
- El módulo detecta automáticamente la configuración según el puerto:
  - Puerto **587**: Usa STARTTLS (secure: false, requireTLS: true)
  - Puerto **465**: Usa SSL/TLS directo (secure: true)
  - Otros puertos: Sin encriptación

### Configuración para Gmail

Si usas Gmail, necesitas generar una **Contraseña de Aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En "Seguridad", habilita "Verificación en dos pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `SMTP_PASS`

### Otros proveedores SMTP

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key
SMTP_PASS=your-aws-secret-key
```

#### Mailtrap (Testing)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

## Métodos Disponibles

### `sendEmailVerification(email, name, verificationToken)`
Envía un email de verificación de cuenta con un enlace para verificar el email.

**Uso:**
```typescript
await this.mailService.sendEmailVerification(
  'user@example.com',
  'Juan Pérez',
  'token-jwt-aqui'
);
```

### `sendPasswordRecovery(email, name, recoveryToken)`
Envía un email de recuperación de contraseña con un enlace temporal.

**Uso:**
```typescript
await this.mailService.sendPasswordRecovery(
  'user@example.com',
  'Juan Pérez',
  'token-jwt-aqui'
);
```

### `sendWelcomeEmail(email, name)`
Envía un email de bienvenida después de que el usuario verifica su cuenta.

**Uso:**
```typescript
await this.mailService.sendWelcomeEmail(
  'user@example.com',
  'Juan Pérez'
);
```

### `sendPasswordChangedConfirmation(email, name)`
Envía un email de confirmación cuando la contraseña es cambiada.

**Uso:**
```typescript
await this.mailService.sendPasswordChangedConfirmation(
  'user@example.com',
  'Juan Pérez'
);
```

### `sendCustomEmail(to, subject, template, context)`
Envía un email personalizado usando un template específico.

**Uso:**
```typescript
await this.mailService.sendCustomEmail(
  'user@example.com',
  'Asunto personalizado',
  'custom-template',
  {
    name: 'Juan Pérez',
    customData: 'Datos adicionales',
  }
);
```

## Templates

Los templates están ubicados en `src/resources/mail/templates/` y usan Handlebars como motor de plantillas.

### Templates disponibles:

1. **`verify-email.hbs`** - Verificación de email
2. **`password-recovery.hbs`** - Recuperación de contraseña
3. **`welcome.hbs`** - Bienvenida
4. **`password-changed.hbs`** - Confirmación de cambio de contraseña

### Crear un nuevo template

1. Crea un archivo `.hbs` en `src/resources/mail/templates/`
2. Usa la estructura HTML base de los templates existentes
3. Define las variables con sintaxis Handlebars: `{{variableName}}`
4. Agrega el método en `mail.service.ts`

**Ejemplo:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
</head>
<body>
    <h1>¡Hola {{name}}!</h1>
    <p>{{message}}</p>
    <p>&copy; {{year}} GetInMotion</p>
</body>
</html>
```

## Testing

Para probar el envío de emails en desarrollo, puedes usar:

- **Mailtrap**: https://mailtrap.io/ (servicio de prueba de emails - ver configuración arriba)
- **MailHog**: Servidor SMTP local
- **Gmail** con una cuenta de prueba

## Manejo de Errores

Los métodos de email están envueltos en try-catch en el AuthService para evitar que un fallo en el envío de email afecte la funcionalidad principal:

```typescript
try {
  await this.mailService.sendPasswordRecovery(email, name, token);
} catch (error) {
  // El email falló pero la operación continúa
}
```

## Integración con AuthService

El servicio de mail está integrado con:

- ✅ **Recuperación de contraseña** - Envía email automáticamente
- ✅ **Cambio de contraseña** - Envía confirmación automáticamente
- 🔄 **Registro de usuario** - Puedes agregar verificación de email
- 🔄 **Bienvenida** - Puedes agregar después de verificar email

## Seguridad

- Los tokens de recuperación expiran en 1 hora
- Los enlaces de verificación deben tener validez limitada
- No se revelan errores de email al usuario por seguridad
- Usar HTTPS en producción para los enlaces
- Las contraseñas SMTP deben estar en variables de entorno

## Producción

En producción, recuerda:

1. ✅ Usar un servicio SMTP profesional (SendGrid, AWS SES, etc.)
2. ✅ Configurar SPF, DKIM y DMARC para tu dominio
3. ✅ Remover el `recoveryToken` de la respuesta en `requestPasswordRecovery`
4. ✅ Implementar rate limiting para prevenir spam
5. ✅ Monitorear la tasa de entrega de emails
6. ✅ Configurar alertas para fallos en el envío

## Recursos Adicionales

- **NestJS Mailer**: https://nest-modules.github.io/mailer/
- **Handlebars**: https://handlebarsjs.com/
- **Nodemailer**: https://nodemailer.com/

