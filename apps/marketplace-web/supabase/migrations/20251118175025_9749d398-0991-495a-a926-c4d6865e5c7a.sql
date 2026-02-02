-- Enable vector extension FIRST
CREATE EXTENSION IF NOT EXISTS vector;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  store_name TEXT,
  category TEXT,
  rating NUMERIC DEFAULT 0,
  reviews_count INT DEFAULT 0,
  is_new BOOLEAN DEFAULT true,
  free_shipping BOOLEAN DEFAULT false,
  stock INT DEFAULT 0,
  sku TEXT UNIQUE,
  tags TEXT[],
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  USING (true);

-- Only allow authenticated users to insert/update/delete products
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS products_embedding_idx 
ON products USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create index for category
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

-- Create index for rating
CREATE INDEX IF NOT EXISTS products_rating_idx ON products(rating);

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_products_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  store_name text,
  category text,
  rating numeric,
  reviews_count int,
  is_new boolean,
  free_shipping boolean,
  stock int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    products.id,
    products.name,
    products.description,
    products.price,
    products.image_url,
    products.store_name,
    products.category,
    products.rating,
    products.reviews_count,
    products.is_new,
    products.free_shipping,
    products.stock,
    1 - (products.embedding <=> query_embedding) as similarity
  FROM products
  WHERE 
    products.embedding IS NOT NULL
    AND 1 - (products.embedding <=> query_embedding) > match_threshold
  ORDER BY products.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, store_name, category, rating, reviews_count, is_new, free_shipping, stock)
VALUES
  ('Smartphone Premium', 'Último modelo con cámara de 108MP y pantalla AMOLED', 899.99, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'TechStore', 'Electrónica', 4.5, 128, true, true, 45),
  ('Laptop Ultrabook', 'Procesador Intel i7, 16GB RAM, SSD 512GB', 1299.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 'CompuWorld', 'Electrónica', 4.8, 95, true, true, 23),
  ('Auriculares Bluetooth', 'Cancelación de ruido activa, batería 30h', 249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'AudioPro', 'Audio', 4.3, 215, false, true, 67),
  ('Cámara Digital', 'Sensor full-frame 24MP, video 4K', 1899.99, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', 'FotoStudio', 'Fotografía', 4.7, 89, true, false, 12),
  ('Smartwatch Fitness', 'Monitor de ritmo cardíaco, GPS integrado', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'WearTech', 'Wearables', 4.1, 342, false, true, 156),
  ('Tablet 10 pulgadas', 'Android 13, 128GB almacenamiento', 349.99, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'TabletZone', 'Electrónica', 4.4, 178, false, true, 89),
  ('Teclado Mecánico RGB', 'Switches Cherry MX, iluminación personalizable', 159.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 'GamerGear', 'Accesorios', 4.6, 267, true, true, 234),
  ('Monitor 4K 27"', 'Panel IPS, HDR10, 144Hz', 549.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', 'DisplayMax', 'Monitores', 4.5, 143, true, false, 34)
ON CONFLICT (id) DO NOTHING;
