# Backup de Producción con pg_dump

Sistema de backup y restauración usando la herramienta oficial `pg_dump` de PostgreSQL.

## 📋 Requisitos Previos

1. **PostgreSQL instalado localmente** con las herramientas `pg_dump` y `pg_restore`
   ```bash
   # Verificar instalación
   pg_dump --version
   pg_restore --version
   ```

2. **Archivo .env configurado** con credenciales de producción y local
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales reales
   ```

3. **Acceso de red a la base de datos de producción en AWS Lightsail**

---

## 🚀 Uso Rápido

### Opción 1: Proceso Completo (Recomendado)

```bash
cd scripts/prod-to-local-migration

# 1. Hacer backup de producción
./backup-prod.sh

# 2. Restaurar en local (usa el archivo generado)
./restore-to-local.sh ./backups/prod_backup_20260323_150000.dump
```

### Opción 2: Comandos Manuales

Si prefieres ejecutar los comandos directamente:

```bash
# Backup
PGPASSWORD="tu_password" pg_dump \
  -h ls-xxxx.rds.amazonaws.com \
  -U dbadmin \
  -d getinmotion \
  -F c \
  -f backup.dump

# Restaurar
PGPASSWORD="postgres" pg_restore \
  -h localhost \
  -U postgres \
  -d getinmotion \
  -c \
  backup.dump
```

---

## 📂 Estructura de Archivos

```
scripts/prod-to-local-migration/
├── backup-prod.sh           # Script de backup
├── restore-to-local.sh      # Script de restauración
├── backups/                 # Carpeta de backups (auto-creada)
│   ├── prod_backup_20260323_150000.dump
│   ├── backup_log_20260323_150000.txt
│   └── restore_log_20260323_150500.txt
├── .env                     # Variables de entorno (NO commitear)
└── .env.example             # Template de variables
```

---

## 🔧 Scripts Disponibles

### 1. `backup-prod.sh`

Descarga un backup completo de la base de datos de producción.

**Características:**
- ✅ Backup en formato comprimido (`.dump`)
- ✅ Genera log detallado
- ✅ Confirmación antes de ejecutar
- ✅ Muestra tamaño del archivo generado

**Opciones de pg_dump usadas:**
- `-F c`: Formato custom (comprimido)
- `-b`: Incluir blobs/binarios
- `-v`: Verbose (detallado)
- `--no-owner`: No incluir información de ownership
- `--no-acl`: No incluir permisos

**Ejemplo de salida:**
```
════════════════════════════════════════════════════════════
  🔄 BACKUP DE PRODUCCIÓN → LOCAL
════════════════════════════════════════════════════════════
✅ Variables de entorno cargadas

📊 Configuración:
  Host: ls-xxxx.rds.amazonaws.com
  Database: getinmotion
  Usuario: dbadmin
  Archivo: ./backups/prod_backup_20260323_150000.dump

¿Continuar con el backup? (y/n): y

🔄 Iniciando backup...
[... progreso ...]

════════════════════════════════════════════════════════════
  ✅ BACKUP COMPLETADO EXITOSAMENTE
════════════════════════════════════════════════════════════
📦 Archivo: ./backups/prod_backup_20260323_150000.dump
📊 Tamaño: 245M
📝 Log: ./backups/backup_log_20260323_150000.txt
```

---

### 2. `restore-to-local.sh`

Restaura un backup en la base de datos local.

**Características:**
- ✅ Validación de archivo de backup
- ✅ Verificación de conexión local
- ✅ Limpieza automática de datos existentes
- ✅ Confirmaciones de seguridad
- ✅ Verificación post-restauración

**Opciones de pg_restore usadas:**
- `-v`: Verbose
- `--clean`: Limpiar objetos antes de crear
- `--if-exists`: No error si objeto no existe
- `--no-owner`: No restaurar ownership
- `--no-acl`: No restaurar permisos

**Uso:**
```bash
./restore-to-local.sh <archivo_backup.dump>
```

**Ejemplo de salida:**
```
════════════════════════════════════════════════════════════
  📥 RESTAURACIÓN DE BACKUP A LOCAL
════════════════════════════════════════════════════════════
✅ Variables de entorno cargadas

📊 Configuración:
  Archivo: ./backups/prod_backup_20260323_150000.dump
  Tamaño: 245M
  Host local: localhost
  Database: getinmotion
  Usuario: postgres

⚠️  ADVERTENCIA:
  Esta operación eliminará TODOS los datos existentes
  ¿Estás seguro de continuar? (y/n): y

1. Verificando conexión a PostgreSQL local...
   ✅ Conexión exitosa

2. Verificando base de datos...
   ✅ Base de datos 'getinmotion' existe

3. Restaurando backup...
[... progreso ...]

════════════════════════════════════════════════════════════
  ✅ RESTAURACIÓN COMPLETADA
════════════════════════════════════════════════════════════

📊 Verificando datos restaurados:
  👥 Usuarios: 260
  🏪 Tiendas: 45
  📦 Productos: 1523
```

---

## ⚙️ Variables de Entorno

### Archivo `.env`

```bash
# ========================================
# PRODUCCIÓN (ORIGEN)
# ========================================
PROD_HOST_DB=ls-xxxx.xxxx.us-east-1.rds.amazonaws.com
PROD_PORT_DB=5432
PROD_USER_DB=dbadmin
PROD_PASS_DB=tu_password_produccion
PROD_NAME_DB=getinmotion

# ========================================
# LOCAL (DESTINO)
# ========================================
LOCAL_HOST_DB=localhost
LOCAL_PORT_DB=5432
LOCAL_USER_DB=postgres
LOCAL_PASS_DB=postgres
LOCAL_NAME_DB=getinmotion
```

---

## 🔍 Troubleshooting

### Error: "pg_dump: command not found"

**Problema:** PostgreSQL no está instalado o no está en el PATH

**Solución:**
```bash
# Windows (Git Bash)
export PATH=$PATH:"/c/Program Files/PostgreSQL/16/bin"

# Linux/Mac
sudo apt-get install postgresql-client  # Debian/Ubuntu
brew install postgresql                  # macOS
```

### Error: "FATAL: password authentication failed"

**Problema:** Credenciales incorrectas en `.env`

**Solución:**
1. Verifica las credenciales en `.env`
2. Prueba conexión manual:
   ```bash
   psql -h ls-xxxx.rds.amazonaws.com -U dbadmin -d getinmotion
   ```

### Error: "could not connect to server"

**Problema:** No hay acceso de red a AWS Lightsail

**Solución:**
1. Verifica que tienes acceso VPN/red a AWS
2. Verifica que el security group permite tu IP
3. Verifica que el hostname es correcto

### Warning: "pg_restore: [archiver (db)] Error while PROCESSING TOC"

**Problema:** Warnings normales por permisos/extensiones

**Solución:**
- Son warnings esperados con `--no-owner` y `--no-acl`
- Si la restauración completa, los datos están correctos
- Revisa el log para verificar

### Error: "database already exists"

**Problema:** La base de datos local ya existe

**Solución:**
El script maneja esto automáticamente usando `--clean --if-exists`

---

## 📊 Comparación con Scripts TypeScript

| Característica | pg_dump/pg_restore | Scripts TypeScript |
|----------------|-------------------|-------------------|
| **Velocidad** | ⚡ Muy rápida | 🐢 Lenta (registro por registro) |
| **Confiabilidad** | ✅ Método oficial PostgreSQL | ⚠️ Depende de implementación |
| **Manejo de dependencias** | ✅ Automático | ❌ Manual |
| **Índices/Constraints** | ✅ Incluidos automáticamente | ❌ Requiere gestión manual |
| **Sequences** | ✅ Preservados | ❌ Pueden perderse |
| **Triggers** | ✅ Incluidos | ❌ No incluidos |
| **Complejidad** | 🟢 Simple | 🔴 Compleja |
| **Tamaño archivo** | 💾 Comprimido | 💾 Sin comprimir |

---

## 🎯 Recomendaciones

### Para desarrollo diario:
- ✅ Usar `pg_dump` - Más rápido y confiable

### Para migración selectiva:
- ⚠️ Usar scripts TypeScript - Cuando solo necesitas tablas específicas

### Para setup inicial:
- ✅ Usar `pg_dump` - Una sola vez para tener todo

### Para CI/CD:
- ✅ Usar `pg_dump` en automated tests

---

## 📝 Notas Importantes

⚠️ **Seguridad:**
- Nunca commitear el archivo `.env`
- Los backups contienen datos de producción sensibles
- Mantener `backups/` en `.gitignore`

⚠️ **Espacio en disco:**
- Los backups pueden ser grandes (100MB - 1GB+)
- El formato custom (`-F c`) comprime automáticamente
- Limpiar backups antiguos periódicamente

⚠️ **Tiempo de ejecución:**
- Backup: 2-10 minutos (depende de tamaño DB)
- Restauración: 5-15 minutos (incluye índices)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en `backups/backup_log_*.txt` y `backups/restore_log_*.txt`
2. Verifica conexiones con `psql` manualmente
3. Consulta la documentación oficial: https://www.postgresql.org/docs/current/app-pgdump.html
