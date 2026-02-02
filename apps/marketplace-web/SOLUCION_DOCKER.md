# 🔧 Solución: Frontend apuntando a Supabase Local

## Problema

El frontend en Docker está apuntando a `http://127.0.0.1:54321` (Supabase local) en lugar de a telar.ia.

## Causa

Las variables de entorno se configuran durante el **BUILD** del frontend, no en runtime. Vite "compila" las variables en el código JavaScript durante `npm run build`.

## Solución

### Opción 1: Reconstruir con Variables Correctas (Recomendado)

```bash
# 1. Detener contenedor actual
docker-compose down

# 2. Limpiar imagen anterior
docker-compose build --no-cache frontend

# 3. Iniciar con las variables correctas
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f frontend
```

### Opción 2: Usar archivo .env

Crea un archivo `.env` en la raíz del proyecto:

```env
# .env
VITE_SUPABASE_URL=https://ylooqmqmoufqtxvetxuj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs
VITE_SEMANTIC_SEARCH_API_URL=https://getinmotion.bgwc43c90at7y.us-east-1.cs.amazonlightsail.com
VITE_SEMANTIC_SEARCH_API_KEY=
```

Luego reconstruye:

```bash
docker-compose build --no-cache frontend
docker-compose up -d
```

### Opción 3: Build Manual con Variables

```bash
# Build con variables explícitas
docker build \
  --build-arg VITE_SUPABASE_URL=https://ylooqmqmoufqtxvetxuj.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs \
  -t marketplace-telar-frontend .

# Ejecutar
docker run -d -p 3000:80 marketplace-telar-frontend
```

## Verificar que Funciona

### 1. Inspeccionar el Build

```bash
# Ver las variables usadas durante el build
docker-compose build frontend 2>&1 | grep VITE_SUPABASE_URL
```

### 2. Verificar en el Navegador

1. Abre http://localhost:3000
2. Abre DevTools (F12)
3. Ve a la pestaña Network
4. Recarga la página
5. Busca requests a `ylooqmqmoufqtxvetxuj.supabase.co`

### 3. Verificar en el Código Compilado

```bash
# Buscar la URL en el código compilado
docker-compose exec frontend grep -r "ylooqmqmoufqtxvetxuj" /usr/share/nginx/html/assets/

# Debería mostrar archivos .js con la URL de telar.ia
```

## Troubleshooting

### Sigue apuntando a localhost

**Causa**: Tienes un `.env.development` o `.env.local` que sobrescribe las variables.

**Solución**:
```bash
# Eliminar archivos .env locales temporalmente
mv .env.development .env.development.bak
mv .env.local .env.local.bak

# Reconstruir
docker-compose build --no-cache frontend
docker-compose up -d

# Restaurar archivos
mv .env.development.bak .env.development
mv .env.local.bak .env.local
```

### Error: "Cannot read properties of undefined"

**Causa**: Las variables no se están pasando correctamente.

**Solución**: Verifica que el archivo `.env` esté en la raíz del proyecto (mismo nivel que `docker-compose.yml`).

### El build usa variables antiguas

**Causa**: Docker está usando caché.

**Solución**:
```bash
# Limpiar todo el caché de Docker
docker-compose down
docker system prune -a
docker-compose build --no-cache frontend
docker-compose up -d
```

## Cómo Funcionan las Variables en Vite

1. **Durante desarrollo** (`npm run dev`):
   - Vite lee `.env.development`
   - Las variables están disponibles en `import.meta.env`

2. **Durante build** (`npm run build`):
   - Vite lee `.env.production`
   - Las variables se **compilan** en el código JavaScript
   - El código resultante tiene las URLs "hardcodeadas"

3. **En Docker**:
   - Las variables se pasan como `build args`
   - Se usan durante `npm run build`
   - El resultado es código JavaScript con las URLs correctas

## Ejemplo de Código Compilado

**Antes del build**:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

**Después del build**:
```javascript
const supabaseUrl = "https://ylooqmqmoufqtxvetxuj.supabase.co";
```

## Comandos de Limpieza Completa

Si nada funciona, limpia todo:

```bash
# 1. Detener y eliminar contenedores
docker-compose down -v

# 2. Eliminar imágenes
docker rmi marketplace-telar-frontend

# 3. Limpiar caché de Docker
docker system prune -a

# 4. Eliminar node_modules local (opcional)
rm -rf node_modules

# 5. Reconstruir desde cero
docker-compose build --no-cache frontend

# 6. Iniciar
docker-compose up -d

# 7. Verificar logs
docker-compose logs -f frontend
```

## Resumen

✅ Las variables se configuran durante el **BUILD**
✅ Usa `.env` o `build args` en `docker-compose.yml`
✅ Reconstruye con `--no-cache` después de cambiar variables
✅ Verifica en DevTools que las requests vayan a telar.ia


