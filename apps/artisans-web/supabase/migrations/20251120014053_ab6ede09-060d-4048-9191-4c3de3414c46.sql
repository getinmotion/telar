-- Agregar columna embedding para búsqueda semántica
ALTER TABLE products 
ADD COLUMN embedding vector(1536);

-- Crear índice para búsqueda rápida de vectores
CREATE INDEX products_embedding_idx 
ON products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Agregar índice GIN para búsqueda en tags
CREATE INDEX IF NOT EXISTS products_tags_idx 
ON products 
USING gin (tags);

-- Comentario para documentación
COMMENT ON COLUMN products.embedding IS 'Vector embedding generado con text-embedding-3-small (1536 dimensiones) para búsqueda semántica';