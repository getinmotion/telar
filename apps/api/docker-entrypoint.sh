#!/bin/bash
set -e

echo "🚀 Starting GetInMotion Server..."

# ========================================
# PASO 1: Esperar a que PostgreSQL esté listo
# ========================================
echo "⏳ Waiting for PostgreSQL to be ready..."

MAX_RETRIES=30
RETRY_COUNT=0

until PGPASSWORD=$PASS_DB psql -h "$HOST_DB" -U "$USER_DB" -d "$NAME_DB" -c '\q' 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ PostgreSQL not available after $MAX_RETRIES attempts (host=$HOST_DB, db=$NAME_DB)"
    exit 1
  fi
  
  echo "⏳ PostgreSQL is unavailable - attempt $RETRY_COUNT/$MAX_RETRIES - sleeping 2s..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# ========================================
# PASO 2: Ejecutar migraciones
# ========================================
echo "📦 Running database migrations..."

if npm run migration:run:prod; then
  echo "✅ Migrations completed successfully!"
else
  echo "⚠️  Migration failed, but continuing startup..."
fi

# ========================================
# PASO 3: Iniciar aplicación
# ========================================
echo "🚀 Starting NestJS application..."

exec node dist/main.js
