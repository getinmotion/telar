# Semantic Search & Embedding Service

Guia de configuracion, pruebas y despliegue en produccion.

---

## Arquitectura

```
Agents Service (Puerto 8000)
├── /api/agents/*     — Agentes conversacionales (sin cambios)
└── /api/search/*     — Busqueda semantica y embeddings (NUEVO)

PostgreSQL Lightsail (shop.* + taxonomy.*)
├── shop.products_core          — productos (483 filas actualmente)
├── shop.product_embeddings     — vectores de productos (NUEVO, requiere pgvector)
└── shop.store_embeddings       — vectores de tiendas (NUEVO, reservado)
```

### Flujos

| Flujo | Quien llama | Endpoint |
|---|---|---|
| Producto creado/editado | NestJS API | `POST /api/search/embeddings/save` |
| Busqueda en marketplace | Frontend | `POST /api/search/products` |
| Indexacion inicial (483 productos) | Admin / script | `POST /api/search/index/products` |
| Reindexado batch | Admin / script | `POST /api/search/index/products { force_reindex: true }` |

---

## 1. Configuracion local (Docker)

### 1.1 Habilitar pgvector en el postgres local

```bash
docker exec -it gim-postgres psql -U postgres -d getinmotion \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 1.2 Crear las tablas de embeddings

```bash
docker exec -it gim-postgres psql -U postgres -d getinmotion
```

```sql
CREATE TABLE IF NOT EXISTS shop.product_embeddings (
    product_id    UUID        PRIMARY KEY
                              REFERENCES shop.products_core(id)
                              ON DELETE CASCADE,
    embedding     vector(1536) NOT NULL,
    model         TEXT        NOT NULL DEFAULT 'text-embedding-3-small',
    semantic_text TEXT        NOT NULL,
    version       INTEGER     NOT NULL DEFAULT 1,
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop.store_embeddings (
    store_id      UUID        PRIMARY KEY
                              REFERENCES shop.stores(id)
                              ON DELETE CASCADE,
    embedding     vector(1536) NOT NULL,
    model         TEXT        NOT NULL DEFAULT 'text-embedding-3-small',
    semantic_text TEXT        NOT NULL,
    version       INTEGER     NOT NULL DEFAULT 1,
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_embeddings_hnsw
    ON shop.product_embeddings
    USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_store_embeddings_hnsw
    ON shop.store_embeddings
    USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_product_embeddings_version
    ON shop.product_embeddings (version);
```

### 1.3 Agregar CATALOG_DB_URL al .env

En `apps/agents/.env`, la variable ya esta agregada apuntando al Docker local:

```
CATALOG_DB_URL=postgresql://postgres:Getinmotion2025*@localhost:5432/getinmotion
```

Si el agente corre dentro de Docker (mismo docker-compose), usa el hostname del servicio:

```
CATALOG_DB_URL=postgresql://postgres:Getinmotion2025*@postgres:5432/getinmotion
```

### 1.4 Arrancar el servicio

```bash
cd apps/agents
pip install -r requirements.txt   # instala asyncpg==0.29.0
uvicorn main:app --reload --port 8000
```

O con docker-compose:

```bash
cd infra/dev
docker compose -f docker-compose.yml -f docker-compose.local.yml up agents --build
```

---

## 2. Endpoints — referencia rapida

Base URL: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

### Generar embedding (NestJS lo usa al crear/editar producto)

```bash
curl -X POST http://localhost:8000/api/search/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Tambor alegre | Transforma cualquier rincon de tu hogar en un espacio lleno de vida | Oficio: Ebanisteria y Talla | Tecnica Principal: Talla | Materiales: Madera"
  }'
```

Respuesta:
```json
{
  "embedding": [0.012, -0.034, ...],
  "dimensions": 1536,
  "model": "text-embedding-3-small",
  "text_preview": "Tambor alegre | Transforma cualquier rincon de tu hogar..."
}
```

### Generar y guardar embedding en un solo paso (recomendado para NestJS)

```bash
curl -X POST http://localhost:8000/api/search/embeddings/save \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid-del-producto",
    "text": "Tambor alegre | Transforma cualquier rincon..."
  }'
```

### Indexar todos los productos (batch inicial)

```bash
curl -X POST http://localhost:8000/api/search/index/products \
  -H "Content-Type: application/json" \
  -d '{
    "force_reindex": false
  }'
```

Respuesta `202 Accepted`:
```json
{
  "message": "Indexing job started in the background",
  "products_requested": null,
  "force_reindex": false
}
```

### Ver progreso del indexado

```bash
curl http://localhost:8000/api/search/index/products/status
```

```json
{
  "running": true,
  "total": 483,
  "indexed": 120,
  "failed": 0,
  "elapsed_seconds": 45.2,
  "errors": []
}
```

### Buscar productos

```bash
curl -X POST http://localhost:8000/api/search/products \
  -H "Content-Type: application/json" \
  -d '{
    "query": "plato decorativo de ceramica azul hecho a mano",
    "top_k": 10,
    "min_similarity": 0.45
  }'
```

Respuesta:
```json
{
  "query": "plato decorativo de ceramica azul hecho a mano",
  "count": 5,
  "min_similarity_used": 0.45,
  "results": [
    {
      "product_id": "...",
      "product_name": "Plato de barro azul",
      "short_description": "...",
      "similarity": 0.8341,
      "craft_name": "Ceramica",
      "piece_type": "decorativa",
      "style": "tradicional",
      "process_type": "manual",
      "materials": "Arcilla, Oxido de cobalto",
      "store_name": "Ceramicas del Valle",
      "store_id": "...",
      "category_name": "Ceramica"
    }
  ]
}
```

Los campos `craft_name`, `piece_type`, `style`, `process_type`, `materials`, `category_name`
sirven como metadata para filtros deterministicos adicionales en el frontend.

---

## 3. Despliegue en produccion (Lightsail)

### 3.1 Habilitar pgvector en la BD de produccion

Conecarse a la BD prod desde DBeaver (o psql) usando las credenciales de Lightsail:

- Host: `ls-6e67bef589cd2010464386600a61d95833fd86dc.c0z8ewoqmsqk.us-east-1.rds.amazonaws.com`
- Puerto: `5432`
- Usuario: `dbtelarprod`
- Password: (ver consola Lightsail > Database-prod-telar > Connect > Show password)

```sql
-- Verificar que pgvector este disponible en esta version de PostgreSQL
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Habilitar la extension
CREATE EXTENSION IF NOT EXISTS vector;
```

> PostgreSQL 18.2 (el que tiene Lightsail) tiene soporte nativo para pgvector >= 0.5.

### 3.2 Crear las tablas y los indices

Ejecutar el mismo SQL del paso 1.2 en la BD prod.

O, si el NestJS API ya esta conectado a la BD prod, correr la migracion de TypeORM:

```bash
# Desde el contenedor gim-api en el servidor Lightsail
docker exec -it gim-api npm run migration:run
# La migracion 1773500000000-CreateProductStoreEmbeddingTables se ejecutara automaticamente
```

### 3.3 Agregar CATALOG_DB_URL en el .env del servidor

En el servidor Lightsail, editar el archivo `.env` del compose:

```
CATALOG_DB_URL=postgresql://dbtelarprod:<password>@ls-6e67bef589cd2010464386600a61d95833fd86dc.c0z8ewoqmsqk.us-east-1.rds.amazonaws.com:5432/<nombre_db>
```

> El nombre de la BD es visible en la consola de Lightsail (generalmente `dbtelarprod` o `postgres`).
> Verificar con: `SELECT current_database();` en DBeaver.

### 3.4 Hacer deploy del servicio de agentes

```bash
# En el servidor Lightsail
cd ~/telar/infra/dev
docker compose pull agents
docker compose up -d agents
docker compose logs -f agents  # verificar que arranque sin errores
```

### 3.5 Indexar los 483 productos existentes

```bash
curl -X POST https://<dominio_o_ip>/api/search/index/products \
  -H "Content-Type: application/json" \
  -d '{ "force_reindex": false }'
```

Monitorear el progreso (esperar ~3-5 minutos para 483 productos):

```bash
watch -n 5 "curl -s https://<dominio_o_ip>/api/search/index/products/status | python3 -m json.tool"
```

### 3.6 Verificar que funciona

```bash
curl -X POST https://<dominio_o_ip>/api/search/products \
  -H "Content-Type: application/json" \
  -d '{ "query": "mochila artesanal wayuu", "top_k": 5 }'
```

---

## 4. Integracion NestJS (cuando se crea/edita un producto)

El NestJS API debe llamar al endpoint `/api/search/embeddings/save` despues de guardar
el producto, enviando el `full_semantic_text` que construya con los datos del producto.

El texto debe seguir el mismo formato de la query SQL:

```
<nombre> | <short_description> | <history> | Oficio: <craft> | Tecnica Principal: <tecnica> | ... | Materiales: <mat1>, <mat2>
```

Ejemplo en NestJS (TypeScript):

```typescript
// Despues de guardar el producto en la BD
const semanticText = buildProductSemanticText(product); // construir el texto

await httpService.post(`${agentsUrl}/api/search/embeddings/save`, {
  product_id: product.id,
  text: semanticText,
}).toPromise();
```

Si la llamada al servicio de embeddings falla, **no debe bloquear la creacion del producto**.
El producto se guarda igual y se puede reindexar con el batch endpoint.

---

## 5. Archivos nuevos/modificados

| Archivo | Descripcion |
|---|---|
| `apps/api/src/migrations/1773500000000-CreateProductStoreEmbeddingTables.ts` | Migracion TypeORM: tablas + indices HNSW |
| `apps/src/database/pg_client.py` | Pool asyncpg para la BD de catalogo |
| `apps/src/api/config.py` | Agrega `catalog_db_url` |
| `apps/agents/services/semantic_search_service.py` | Logica central: search, batch index, upsert |
| `apps/agents/search_api.py` | Router FastAPI `/api/search/*` |
| `apps/agents/main.py` | Monta `search_router`, inicializa/cierra pool |
| `apps/agents/requirements.txt` | Agrega `asyncpg==0.29.0` |
| `apps/agents/.env.example` | Documenta `CATALOG_DB_URL` |
| `apps/agents/.env` | Agrega `CATALOG_DB_URL` para dev local |
| `apps/agents/api.py` | Elimina la seccion de embeddings antigua |
