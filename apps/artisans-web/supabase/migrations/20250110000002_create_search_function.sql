-- Create RPC function for semantic search with filters
-- This function performs vector similarity search with optional filters

CREATE OR REPLACE FUNCTION public.search_store_embeddings(
  query_embedding VECTOR(1536),
  match_count INTEGER DEFAULT 20,
  filter_craft_type TEXT DEFAULT NULL,
  filter_region TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  filter_price_min DECIMAL DEFAULT NULL,
  filter_price_max DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  shop_id UUID,
  product_id UUID,
  shop_name TEXT,
  shop_description TEXT,
  shop_story TEXT,
  craft_type TEXT,
  region TEXT,
  product_name TEXT,
  product_description TEXT,
  price DECIMAL,
  category TEXT,
  combined_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.id,
    se.shop_id,
    se.product_id,
    se.shop_name,
    se.shop_description,
    se.shop_story,
    se.craft_type,
    se.region,
    se.product_name,
    se.product_description,
    se.price,
    se.category,
    se.combined_text,
    -- Convert cosine distance to similarity (1 - distance)
    (1 - (se.embedding <=> query_embedding))::FLOAT AS similarity
  FROM
    public.store_embeddings se
  WHERE
    -- Apply filters only if provided
    (filter_craft_type IS NULL OR se.craft_type = filter_craft_type)
    AND (filter_region IS NULL OR se.region = filter_region)
    AND (filter_category IS NULL OR se.category = filter_category)
    AND (filter_price_min IS NULL OR se.price >= filter_price_min)
    AND (filter_price_max IS NULL OR se.price <= filter_price_max)
  ORDER BY
    se.embedding <=> query_embedding  -- Cosine distance (lower is better)
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_store_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_store_embeddings TO anon;
GRANT EXECUTE ON FUNCTION public.search_store_embeddings TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION public.search_store_embeddings IS 'Performs semantic search on store embeddings using cosine similarity with optional filters';

