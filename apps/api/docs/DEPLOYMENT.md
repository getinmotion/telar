# 🚀 Guía de Despliegue - GetInMotion Server

Guía completa para desplegar el servidor GetInMotion usando Docker y Docker Compose.

---

## 📋 **Requisitos Previos**

- ✅ Docker instalado (versión 20.10+)
- ✅ Docker Compose instalado (versión 2.0+)
- ✅ Servidor con al menos 2GB RAM
- ✅ Puerto 3040 disponible (API)
- ✅ Puerto 5432 disponible (PostgreSQL) - opcional si no expones la BD

---

## 🔧 **Configuración Inicial**

### **1. Configurar Variables de Entorno**

Copia el archivo de ejemplo y configura tus variables:

```bash
# Opción 1: Copiar y editar
cp .env.production .env

# Opción 2: Crear desde cero
nano .env
```

**Variables REQUERIDAS** en `.env`:

```env
# Database
HOST_DB=postgres
PORT_DB=5432
USER_DB=getinmotion_user
PASS_DB=tu_password_super_seguro_aqui
NAME_DB=getinmotion_prod

# JWT (mínimo 32 caracteres)
PASSWORD_SECRET=tu_jwt_secret_muy_largo_y_seguro_minimo_64_caracteres

# OpenAI
OPENAI_API_KEY=sk-tu-openai-api-key-aqui

# App
PORT=3040
NODE_ENV=production
ENVIRONMENT_PROJECT=production
```

**⚠️ IMPORTANTE**: 
- ❌ **NUNCA** subas el archivo `.env` a Git
- ✅ Usa contraseñas fuertes (mínimo 16 caracteres)
- ✅ Cambia todos los valores de ejemplo
- ✅ `HOST_DB` debe ser `postgres` (nombre del servicio Docker)

---

## 🏗️ **Estructura de Archivos Docker**

```
getinmotion-server/
├── Dockerfile              # Configuración de la imagen de la app
├── docker-compose.yml      # Orquestación de servicios
├── docker-entrypoint.sh    # Script de inicio (ejecuta migraciones)
├── init-db.sql            # Script de inicialización de PostgreSQL
├── .dockerignore          # Archivos a ignorar en la imagen
├── .env                   # Variables de entorno (NO SUBIR A GIT)
└── .env.example           # Ejemplo de variables
```

---

## 🚀 **Despliegue Paso a Paso**

### **Opción 1: Despliegue Completo** (Recomendado para producción)

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd getinmotion-server

# 2. Configurar variables de entorno
cp .env.production .env
nano .env  # Editar con tus valores reales

# 3. Construir y levantar servicios
docker-compose up -d --build

# 4. Ver logs en tiempo real
docker-compose logs -f

# 5. Verificar que todo esté corriendo
docker-compose ps
```

### **Opción 2: Solo Base de Datos** (Para desarrollo local)

```bash
# Levantar solo PostgreSQL
docker-compose up -d postgres

# La app corre localmente con npm run start:dev
```

---

## 📊 **Comandos Útiles**

### **Ver estado de servicios**
```bash
docker-compose ps
```

### **Ver logs**
```bash
# Todos los servicios
docker-compose logs -f

# Solo la app
docker-compose logs -f app

# Solo PostgreSQL
docker-compose logs -f postgres
```

### **Reiniciar servicios**
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo la app
docker-compose restart app
```

### **Detener servicios**
```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar TODO (incluyendo volúmenes - ⚠️ PELIGRO: borra la BD)
docker-compose down -v
```

### **Reconstruir la aplicación**
```bash
# Reconstruir la imagen
docker-compose build app

# Reconstruir y reiniciar
docker-compose up -d --build app
```

---

## 🔄 **Ejecutar Migraciones Manualmente**

Si necesitas ejecutar migraciones después del despliegue:

```bash
# Entrar al contenedor de la app
docker-compose exec app sh

# Ejecutar migraciones
npm run migration:run

# Ver migraciones pendientes
npm run migration:show

# Salir del contenedor
exit
```

---

## 🗄️ **Gestión de Base de Datos**

### **Conectarse a PostgreSQL**
```bash
# Desde el contenedor
docker-compose exec postgres psql -U getinmotion_user -d getinmotion_prod

# Desde tu máquina (si expusiste el puerto)
psql -h localhost -p 5432 -U getinmotion_user -d getinmotion_prod
```

### **Backup de Base de Datos**
```bash
# Crear backup
docker-compose exec postgres pg_dump -U getinmotion_user getinmotion_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U getinmotion_user -d getinmotion_prod < backup.sql
```

### **Limpiar y reiniciar BD** (⚠️ PELIGRO: borra todos los datos)
```bash
# Detener servicios
docker-compose down

# Eliminar volumen de PostgreSQL
docker volume rm getinmotion-postgres-data

# Levantar de nuevo (se creará BD limpia)
docker-compose up -d
```

---

## 🔍 **Verificación del Despliegue**

### **1. Verificar que los contenedores estén corriendo**
```bash
docker-compose ps
```

Deberías ver:
```
NAME                    STATUS          PORTS
getinmotion-app         Up 2 minutes    0.0.0.0:3040->3040/tcp
getinmotion-postgres    Up 2 minutes    0.0.0.0:5432->5432/tcp
```

### **2. Verificar logs de inicio**
```bash
docker-compose logs app | tail -50
```

Deberías ver:
```
✅ PostgreSQL is ready!
📦 Running database migrations...
✅ Migrations completed successfully!
🚀 Starting NestJS application...
🐬 Conectado a la DB: getinmotion_prod
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO Application is running on: http://0.0.0.0:3040
```

### **3. Verificar API**
```bash
# Health check
curl http://localhost:3040/health

# Swagger docs
curl http://localhost:3040/api/docs
```

### **4. Verificar PostgreSQL**
```bash
docker-compose exec postgres psql -U getinmotion_user -d getinmotion_prod -c "SELECT version();"
```

---

## 🌐 **Acceso a la Aplicación**

Una vez desplegado, accede a:

- **API Base**: `http://localhost:3040`
- **Swagger Docs**: `http://localhost:3040/api/docs`
- **Health Check**: `http://localhost:3040/health`

Si estás en un servidor remoto, reemplaza `localhost` con la IP del servidor.

---

## 🔒 **Seguridad en Producción**

### **1. Variables de Entorno Seguras**

✅ **HACER**:
- Usar passwords largos y aleatorios (32+ caracteres)
- Generar `PASSWORD_SECRET` único con: `openssl rand -base64 64`
- Restringir permisos del archivo `.env`: `chmod 600 .env`
- Usar secrets manager en producción (AWS Secrets Manager, etc)

❌ **NO HACER**:
- Subir `.env` a Git
- Usar contraseñas simples o predeterminadas
- Compartir el archivo `.env` por email/chat

### **2. Configurar Firewall**

```bash
# Permitir solo puerto 3040 (API)
sudo ufw allow 3040/tcp

# NO exponer PostgreSQL públicamente (solo internamente en Docker)
# Si no necesitas acceso externo a PostgreSQL, elimina la sección ports: del servicio postgres
```

### **3. Configurar Reverse Proxy** (Nginx/Caddy)

Se recomienda usar un reverse proxy para:
- HTTPS/SSL
- Balanceo de carga
- Compresión
- Rate limiting

---

## 📈 **Escalado y Performance**

### **Limitar Recursos**

Edita `docker-compose.yml` para limitar recursos:

```yaml
services:
  app:
    # ... resto de configuración
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### **Múltiples Instancias**

```bash
# Escalar a 3 instancias de la app
docker-compose up -d --scale app=3
```

---

## 🐛 **Troubleshooting**

### **Error: "Cannot connect to database"**

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar variables de entorno
docker-compose exec app env | grep DB
```

### **Error: "Migrations failed"**

```bash
# Entrar al contenedor
docker-compose exec app sh

# Ejecutar migraciones manualmente
npm run migration:run

# Ver estado de migraciones
npm run migration:show
```

### **Error: "Port 3040 already in use"**

```bash
# Cambiar puerto en .env
PORT=3041

# O detener el servicio que usa el puerto
sudo lsof -i :3040
sudo kill -9 <PID>
```

### **Error: "Out of memory"**

```bash
# Verificar uso de memoria
docker stats

# Limpiar imágenes y contenedores no usados
docker system prune -a

# Aumentar memoria de Docker Desktop (si aplica)
```

---

## 📝 **Logs y Monitoreo**

### **Ubicación de Logs**

- **App logs**: `docker-compose logs app`
- **PostgreSQL logs**: `docker-compose logs postgres`
- **Logs persistentes**: `./logs` (montado como volumen)

### **Monitoreo en Tiempo Real**

```bash
# Recursos del sistema
docker stats

# Logs en vivo
docker-compose logs -f --tail=100

# Solo errores
docker-compose logs app 2>&1 | grep -i error
```

---

## 🔄 **Actualización de la Aplicación**

```bash
# 1. Detener servicios
docker-compose down

# 2. Actualizar código
git pull origin main

# 3. Reconstruir imagen
docker-compose build app

# 4. Levantar con nueva versión
docker-compose up -d

# 5. Verificar logs
docker-compose logs -f app
```

---

## 💾 **Backup y Restauración**

### **Backup Automático Diario**

Crea un cron job:

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * cd /ruta/a/getinmotion-server && docker-compose exec -T postgres pg_dump -U getinmotion_user getinmotion_prod | gzip > /backups/getinmotion_$(date +\%Y\%m\%d).sql.gz
```

### **Restaurar Backup**

```bash
# Descomprimir y restaurar
gunzip < backup_20260127.sql.gz | docker-compose exec -T postgres psql -U getinmotion_user -d getinmotion_prod
```

---

## 🌍 **Despliegue en Servidor Remoto**

### **1. Servidor con Docker**

```bash
# En tu servidor (via SSH)
ssh user@tu-servidor.com

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clonar proyecto
git clone <tu-repo>
cd getinmotion-server

# Configurar .env
nano .env

# Desplegar
docker-compose up -d --build
```

### **2. Con Nginx Reverse Proxy**

```nginx
# /etc/nginx/sites-available/getinmotion
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3040;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ✅ **Checklist de Despliegue**

- [ ] Variables de entorno configuradas en `.env`
- [ ] Contraseñas seguras generadas
- [ ] Puerto 3040 disponible
- [ ] Docker y Docker Compose instalados
- [ ] Firewall configurado
- [ ] Backup automático configurado (recomendado)
- [ ] Monitoreo configurado (opcional)
- [ ] SSL/HTTPS configurado con reverse proxy (recomendado)
- [ ] Logs siendo monitoreados

---

## 🎯 **Comandos Rápidos**

```bash
# Desplegar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Backup BD
docker-compose exec postgres pg_dump -U getinmotion_user getinmotion_prod > backup.sql

# Ver estado
docker-compose ps

# Limpiar sistema
docker system prune -a
```

---

## 📞 **Soporte**

Si encuentras problemas:
1. Verifica los logs: `docker-compose logs -f`
2. Revisa las variables de entorno: `docker-compose exec app env`
3. Verifica conectividad a BD: `docker-compose exec app npm run migration:show`

---

¡Despliegue exitoso! 🚀
