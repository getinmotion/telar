#!/bin/bash

# ============================================
# BACKUP DE BASE DE DATOS DE PRODUCCIÓN
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
echo "  🔄 BACKUP DE PRODUCCIÓN → LOCAL"
echo "════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Cargar variables de entorno
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo -e "${GREEN}✅ Variables de entorno cargadas${NC}\n"
else
  echo -e "${RED}❌ Error: No se encontró el archivo .env${NC}"
  echo "Copia .env.example a .env y completa las credenciales"
  exit 1
fi

# Crear directorio de backups
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generar nombre de archivo con timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/prod_backup_$DATE.dump"

echo -e "${YELLOW}📊 Configuración:${NC}"
echo "  Host: $PROD_HOST_DB"
echo "  Database: $PROD_NAME_DB"
echo "  Usuario: $PROD_USER_DB"
echo "  Archivo: $BACKUP_FILE"
echo ""

# Confirmar
read -p "¿Continuar con el backup? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Backup cancelado${NC}"
  exit 0
fi

echo -e "${BLUE}🔄 Iniciando backup...${NC}"
echo ""

# Ejecutar pg_dump
PGPASSWORD="$PROD_PASS_DB" pg_dump \
  -h "$PROD_HOST_DB" \
  -p "$PROD_PORT_DB" \
  -U "$PROD_USER_DB" \
  -d "$PROD_NAME_DB" \
  -F c \
  -b \
  -v \
  --no-owner \
  --no-acl \
  -f "$BACKUP_FILE" 2>&1 | tee "$BACKUP_DIR/backup_log_$DATE.txt"

# Verificar éxito
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo ""
  echo -e "${GREEN}"
  echo "════════════════════════════════════════════════════════════"
  echo "  ✅ BACKUP COMPLETADO EXITOSAMENTE"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${NC}"

  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}📦 Archivo: $BACKUP_FILE${NC}"
  echo -e "${GREEN}📊 Tamaño: $FILE_SIZE${NC}"
  echo -e "${GREEN}📝 Log: $BACKUP_DIR/backup_log_$DATE.txt${NC}"
  echo ""

  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}📋 SIGUIENTE PASO - RESTAURAR EN LOCAL:${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "1. Verifica que tu base de datos local esté corriendo:"
  echo "   ${BLUE}psql -h localhost -U postgres -l${NC}"
  echo ""
  echo "2. Ejecuta el script de restauración:"
  echo "   ${BLUE}./restore-to-local.sh $BACKUP_FILE${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}"
  echo "════════════════════════════════════════════════════════════"
  echo "  ❌ ERROR EN EL BACKUP"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${NC}"
  echo "Revisa el log: $BACKUP_DIR/backup_log_$DATE.txt"
  exit 1
fi
