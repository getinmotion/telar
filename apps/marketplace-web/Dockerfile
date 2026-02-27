# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Variables de entorno para el build (se pueden sobrescribir en docker-compose)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SEMANTIC_SEARCH_API_URL
ARG VITE_SEMANTIC_SEARCH_API_KEY
ARG VITE_BACKEND_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SEMANTIC_SEARCH_API_URL=$VITE_SEMANTIC_SEARCH_API_URL
ENV VITE_SEMANTIC_SEARCH_API_KEY=$VITE_SEMANTIC_SEARCH_API_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build de producción (usa variables de entorno)
RUN npm run build

# Verificar que las variables se aplicaron correctamente
RUN echo "Build completado con VITE_SUPABASE_URL=$VITE_SUPABASE_URL"

# Stage 2: Production
FROM nginx:alpine

# Copiar archivos build desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]


