# 🐳 Docker - Frontend Marketplace Telar

## Inicio Rápido

### 1. Configurar Variables de Entorno

**IMPORTANTE**: Las variables se usan durante el BUILD, no en runtime.

```bash
# Opción A: Usar .env (recomendado)
# Crea un archivo .env en la raíz:
cat > .env << EOF
VITE_SUPABASE_URL=https://ylooqmqmoufqtxvetxuj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs
EOF

# Opción B: Usar .env.production (ya incluido)
# El archivo .env.production ya tiene las variables correctas
```

### 2. Construir y Ejecutar

```bash
# Construir e iniciar el contenedor
docker-compose build --no-cache frontend
docker-compose up -d

# Ver logs
docker-compose logs -f frontend
```

**Nota**: Usa `--no-cache` para asegurar que las variables se apliquen correctamente.

### 3. Acceder

Abre tu navegador en: **http://localhost:3000**

## Comandos Útiles

```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f frontend

# Reconstruir (después de cambios en código)
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Ver estado
docker-compose ps

# Acceder al contenedor
docker-compose exec frontend sh
```

## Configuración

### Variables de Entorno

Las variables se configuran en el archivo `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://ylooqmqmoufqtxvetxuj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key

# Búsqueda Semántica (Opcional)
VITE_SEMANTIC_SEARCH_API_URL=
VITE_SEMANTIC_SEARCH_API_KEY=
```

### Cambiar Puerto

Para cambiar el puerto del frontend, edita `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Cambiar 3000 por el puerto que quieras
```

## Estructura

```
.
├── docker-compose.yml    # Configuración de Docker Compose
├── Dockerfile            # Instrucciones para construir la imagen
├── nginx.conf            # Configuración de Nginx
├── .dockerignore         # Archivos a ignorar en el build
├── .env.example          # Ejemplo de variables de entorno
└── README_DOCKER.md      # Esta documentación
```

## Build Multi-Stage

El `Dockerfile` usa un build multi-stage para optimizar:

1. **Stage 1 (builder)**: Instala dependencias y construye el proyecto
2. **Stage 2 (production)**: Copia solo los archivos necesarios a Nginx

**Ventajas**:
- Imagen final más pequeña (~50MB vs ~500MB)
- Solo incluye archivos de producción
- Más rápido de desplegar

## Troubleshooting

### Error: "Cannot connect to Supabase"

**Causa**: Variables de entorno incorrectas.

**Solución**:
1. Verifica que `.env` tenga las URLs correctas
2. Reconstruye la imagen:
   ```bash
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

### Error: "Port 3000 is already in use"

**Causa**: El puerto 3000 está ocupado.

**Solución**: Cambia el puerto en `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Usa otro puerto
```

### Los cambios en el código no se reflejan

**Causa**: La imagen no se reconstruyó.

**Solución**:
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Error: "CORS policy"

**Causa**: El frontend intenta conectarse a una API con CORS bloqueado.

**Solución**: Verifica que `VITE_SUPABASE_URL` apunte a la URL correcta de Supabase.

## Producción

Para producción, considera:

1. **Usar dominio propio**: Configura Nginx con tu dominio
2. **SSL/TLS**: Agrega certificados HTTPS
3. **Variables de entorno**: Usa secrets management
4. **Logging**: Configura logs centralizados
5. **Monitoring**: Agrega healthchecks y métricas

### Ejemplo con SSL (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... resto de la configuración
}
```

## Despliegue en AWS/Cloud

Ver documentación en `docs/` para:
- AWS ECS Fargate
- AWS EC2
- Google Cloud Run
- Azure Container Instances

## Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

