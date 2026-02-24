-- Agregar columna marketplace_links a la tabla products
ALTER TABLE products 
ADD COLUMN marketplace_links JSONB DEFAULT '{}'::jsonb;

-- Crear índice para búsquedas eficientes
CREATE INDEX idx_products_marketplace_links ON products USING gin(marketplace_links);

-- Agregar comentario explicativo
COMMENT ON COLUMN products.marketplace_links IS 
'Links y metadatos de productos vinculados en marketplaces externos (Amazon, MercadoLibre, etc.)';