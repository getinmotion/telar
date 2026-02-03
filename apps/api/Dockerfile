# ========================================
# STAGE 1: Dependencies
# ========================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev para compilar)
RUN npm ci

# ========================================
# STAGE 2: Build
# ========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# ========================================
# STAGE 3: Production
# ========================================
FROM node:20-alpine AS production

WORKDIR /app

# Instalar bash para el script de inicio
RUN apk add --no-cache bash postgresql-client

# Copiar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde build stage (dist incluye dist/migrations por nest build)
COPY --from=build /app/dist ./dist

# Copiar config (incluye data-source.prod.js para migraciones en producción)
COPY src/config ./src/config

COPY docker-entrypoint.sh ./
RUN sed -i 's/\r$//' docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Exponer puerto
EXPOSE 3040

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3040/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
ENTRYPOINT ["./docker-entrypoint.sh"]
