# 🔒 Guía para Corregir el Error SSL en www.telar.co

## ❌ Problema
`NET::ERR_CERT_COMMON_NAME_INVALID` al acceder a www.telar.co

## ✅ Solución
Crear certificados SSL separados para mejor organización.

---

## 📋 Pasos a Seguir

### 1. Conectarse al Servidor
```bash
ssh usuario@52.44.3.34
```

### 2. Verificar el Certificado Actual (Opcional)
```bash
sudo openssl x509 -in /etc/letsencrypt/live/prod-api.telar.co/fullchain.pem -text -noout | grep -A1 "Subject Alternative Name"
```
**Nota**: Probablemente verás que www.telar.co NO está en la lista.

### 3. Generar los Nuevos Certificados

#### Certificado 1: API y servicios internos
```bash
sudo certbot certonly --nginx \
  -d prod-api.telar.co \
  -d app.telar.co \
  -d moderation.telar.co \
  -d prod-agents.telar.co \
  -d prod-payment.telar.co
```

#### Certificado 2: Marketplace público
```bash
sudo certbot certonly --nginx \
  -d telar.co \
  -d www.telar.co
```

**Importante**: Cuando certbot pregunte si quieres expandir/reemplazar el certificado existente:
- Para el primer comando: Selecciona **"Expand"** o **"Replace"**
- Para el segundo comando: Creará un certificado nuevo en `/etc/letsencrypt/live/telar.co/`

### 4. Subir la Nueva Configuración de Nginx
Desde tu máquina local (Windows):
```bash
# Copiar el archivo al servidor
scp infra/prod/nginx.conf usuario@52.44.3.34:/tmp/nginx.conf

# Conectarse y moverlo a la ubicación correcta
ssh usuario@52.44.3.34
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/telar
```

### 5. Validar y Aplicar
```bash
# Verificar que la configuración sea válida
sudo nginx -t

# Si todo está OK, recargar nginx
sudo systemctl reload nginx
```

### 6. Verificar
Abre en el navegador:
- ✅ https://www.telar.co (debe redirigir a https://telar.co sin error)
- ✅ https://telar.co (debe funcionar)
- ✅ https://prod-api.telar.co (debe seguir funcionando)
- ✅ https://app.telar.co (debe seguir funcionando)

---

## 🎯 Resultado Esperado

Después de estos pasos:
- **telar.co** y **www.telar.co** usarán el certificado `/etc/letsencrypt/live/telar.co/`
- Los demás dominios usarán el certificado `/etc/letsencrypt/live/prod-api.telar.co/`
- **NO** más errores SSL en www.telar.co

---

## 🔄 Renovación Automática

Let's Encrypt renovará ambos certificados automáticamente. Para verificar:
```bash
sudo certbot renew --dry-run
```

---

## 🆘 Si Algo Sale Mal

### Restaurar configuración anterior:
```bash
# Si guardaste un backup
sudo cp /etc/nginx/sites-available/telar.backup /etc/nginx/sites-available/telar
sudo nginx -t && sudo systemctl reload nginx
```

### Ver logs de nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Listar certificados disponibles:
```bash
sudo certbot certificates
```
