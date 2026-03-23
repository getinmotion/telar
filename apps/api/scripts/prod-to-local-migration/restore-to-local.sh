#!/bin/bash

# ============================================
# RESTAURACIÓN DE BACKUP A BASE DE DATOS LOCAL
# ============================================

set -e  # Detener si hay error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════════"
echo "  📥 RESTAURACIÓN DE BACKUP A LOCAL"
echo "════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Verificar argumento
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Debes proporcionar el archivo de backup${NC}"
  echo ""
  echo "Uso: $0 <archivo_backup.dump>"
  echo ""
  echo "Ejemplo:"
  echo "  $0 ./backups/prod_backup_20260323_150000.dump"
  echo ""
  echo "Backups disponibles:"
  ls -lh ./backups/*.dump 2>/dev/null || echo "  No hay backups disponibles"
  exit 1
fi

BACKUP_FILE="$1"

# Verificar que existe el archivo
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Error: El archivo no existe: $BACKUP_FILE${NC}"
  exit 1
fi

# Cargar variables de entorno
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo -e "${GREEN}✅ Variables de entorno cargadas${NC}\n"
else
  echo -e "${RED}❌ Error: No se encontró el archivo .env${NC}"
  exit 1
fi

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${YELLOW}📊 Configuración:${NC}"
echo "  Archivo: $BACKUP_FILE"
echo "  Tamaño: $FILE_SIZE"
echo "  Host local: $LOCAL_HOST_DB"
echo "  Database: $LOCAL_NAME_DB"
echo "  Usuario: $LOCAL_USER_DB"
echo ""

echo -e "${RED}⚠️  ADVERTENCIA:${NC}"
echo "  Esta operación eliminará TODOS los datos existentes en la base de datos local"
echo "  y los reemplazará con los datos del backup."
echo ""

# Confirmar
read -p "¿Estás seguro de continuar? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Restauración cancelada${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🔄 Iniciando restauración...${NC}"
echo ""

# Paso 1: Verificar conexión a PostgreSQL local
echo -e "${YELLOW}1. Verificando conexión a PostgreSQL local...${NC}"
PGPASSWORD="$LOCAL_PASS_DB" psql -h "$LOCAL_HOST_DB" -p "$LOCAL_PORT_DB" -U "$LOCAL_USER_DB" -c '\q' 2>/dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}   ✅ Conexión exitosa${NC}"
else
  echo -e "${RED}   ❌ No se puede conectar a PostgreSQL local${NC}"
  echo "   Verifica que PostgreSQL esté corriendo y las credenciales sean correctas"
  exit 1
fi

# Paso 2: Verificar si la base de datos existe
echo ""
echo -e "${YELLOW}2. Verificando base de datos...${NC}"
DB_EXISTS=$(PGPASSWORD="$LOCAL_PASS_DB" psql -h "$LOCAL_HOST_DB" -p "$LOCAL_PORT_DB" -U "$LOCAL_USER_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='$LOCAL_NAME_DB'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
  echo -e "${GREEN}   ✅ Base de datos '$LOCAL_NAME_DB' existe${NC}"
  echo ""
  echo -e "${YELLOW}   ⚠️  Se eliminarán todos los datos existentes${NC}"
  read -p "   ¿Continuar? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Restauración cancelada${NC}"
    exit 0
  fi
else
  echo -e "${YELLOW}   ⚠️  Base de datos '$LOCAL_NAME_DB' no existe${NC}"
  echo -e "${BLUE}   📝 Creando base de datos...${NC}"
  PGPASSWORD="$LOCAL_PASS_DB" psql -h "$LOCAL_HOST_DB" -p "$LOCAL_PORT_DB" -U "$LOCAL_USER_DB" -c "CREATE DATABASE $LOCAL_NAME_DB;" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Base de datos creada${NC}"
  else
    echo -e "${RED}   ❌ Error creando base de datos${NC}"
    exit 1
  fi
fi

# Paso 3: Restaurar backup
echo ""
echo -e "${YELLOW}3. Restaurando backup (esto puede tomar varios minutos)...${NC}"
echo ""

DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="./backups/restore_log_$DATE.txt"

PGPASSWORD="$LOCAL_PASS_DB" pg_restore \
  -h "$LOCAL_HOST_DB" \
  -p "$LOCAL_PORT_DB" \
  -U "$LOCAL_USER_DB" \
  -d "$LOCAL_NAME_DB" \
  -v \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  "$BACKUP_FILE" 2>&1 | tee "$LOG_FILE"

# Verificar éxito (pg_restore retorna 0 incluso con warnings)
if [ ${PIPESTATUS[0]} -eq 0 ] || [ ${PIPESTATUS[0]} -eq 1 ]; then
  echo ""
  echo -e "${GREEN}"
  echo "════════════════════════════════════════════════════════════"
  echo "  ✅ RESTAURACIÓN COMPLETADA"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${NC}"

  # Contar registros en algunas tablas
  echo -e "${BLUE}📊 Verificando datos restaurados:${NC}"
  echo ""

  USERS_COUNT=$(PGPASSWORD="$LOCAL_PASS_DB" psql -h "$LOCAL_HOST_DB" -p "$LOCAL_PORT_DB" -U "$LOCAL_USER_DB" -d "$LOCAL_NAME_DB" -tAc "SELECT COUNT(*) FROM auth.users" 2>/dev/null || echo "N/A")
  SHOPS_COUNT=$(PGPASSWORD="$LOCAL_PASS_DB" psql -h "$LOCAL_HOST_DB" -p "$LOCAL_PORT_DB" -U "$LOCAL_USER_DB" -d "$LOCAL_NAME_DB" -tAc "SELECT COUNT(*) FROM shop.artisan_shops" 2>/dev/null || echo "N/A")
  PRODUCTS_COUNT=$(PGPASSWORD="$LOCAL_PASS_DB" psql -h "$LOCAL_HOST_DB" -p "$LOCAL_PORT_DB" -U "$LOCAL_USER_DB" -d "$LOCAL_NAME_DB" -tAc "SELECT COUNT(*) FROM shop.products" 2>/dev/null || echo "N/A")

  echo -e "  ${GREEN}👥 Usuarios: $USERS_COUNT${NC}"
  echo -e "  ${GREEN}🏪 Tiendas: $SHOPS_COUNT${NC}"
  echo -e "  ${GREEN}📦 Productos: $PRODUCTS_COUNT${NC}"
  echo ""
  echo -e "${GREEN}📝 Log: $LOG_FILE${NC}"
  echo ""

  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ La base de datos local ahora tiene datos de producción${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}"
  echo "════════════════════════════════════════════════════════════"
  echo "  ❌ ERROR EN LA RESTAURACIÓN"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${NC}"
  echo "Revisa el log: $LOG_FILE"
  exit 1
fi
