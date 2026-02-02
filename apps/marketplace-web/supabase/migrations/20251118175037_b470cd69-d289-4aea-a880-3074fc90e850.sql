-- Fix function search path
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
SECURITY DEFINER
SET search_path = public
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
