-- Create store_embeddings table for semantic search
-- This table stores vector embeddings of shop and product data

CREATE TABLE IF NOT EXISTS public.store_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  shop_id UUID NOT NULL REFERENCES public.artisan_shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Shop fields (denormalized for search performance)
  shop_name TEXT,
  shop_description TEXT,
  shop_story TEXT,
  craft_type TEXT,
  region TEXT,
  
  -- Product fields (null if this is shop-only embedding)
  product_name TEXT,
  product_description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  
  -- Combined text used for embedding generation
  combined_text TEXT NOT NULL,
  
  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding VECTOR(1536) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique combinations (one embedding per shop-product pair)
  UNIQUE(shop_id, product_id)
);

-- Create indexes for performance

-- B-tree indexes for foreign key lookups
CREATE INDEX idx_store_embeddings_shop_id ON public.store_embeddings(shop_id);
CREATE INDEX idx_store_embeddings_product_id ON public.store_embeddings(product_id) WHERE product_id IS NOT NULL;

-- Indexes for filtering
CREATE INDEX idx_store_embeddings_craft_type ON public.store_embeddings(craft_type) WHERE craft_type IS NOT NULL;
CREATE INDEX idx_store_embeddings_region ON public.store_embeddings(region) WHERE region IS NOT NULL;
CREATE INDEX idx_store_embeddings_category ON public.store_embeddings(category) WHERE category IS NOT NULL;

-- IVFFlat index for vector similarity search (cosine distance)
-- Lists parameter: sqrt(total_rows) is a good starting point
-- For 1000 shops * 10 products = ~10,000 rows, lists=100 is reasonable
CREATE INDEX idx_store_embeddings_vector_ivfflat 
ON public.store_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative: HNSW index for better performance at scale (commented out for now)
-- Uncomment this and remove IVFFlat index above if you need better query performance
-- CREATE INDEX idx_store_embeddings_vector_hnsw 
-- ON public.store_embeddings 
-- USING hnsw (embedding vector_cosine_ops)
-- WITH (m = 16, ef_construction = 64);

-- Enable Row Level Security
ALTER TABLE public.store_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read embeddings (needed for public search)
CREATE POLICY "Public can view store embeddings" 
ON public.store_embeddings 
FOR SELECT 
USING (true);

-- RLS Policy: Only authenticated users can insert/update embeddings
-- This will be done by the backend service using a service role key
CREATE POLICY "Service can manage embeddings" 
ON public.store_embeddings 
FOR ALL 
USING (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_store_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_store_embeddings_updated_at_trigger
  BEFORE UPDATE ON public.store_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_store_embeddings_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.store_embeddings IS 'Stores vector embeddings of artisan shops and products for semantic search';
COMMENT ON COLUMN public.store_embeddings.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN public.store_embeddings.combined_text IS 'Combined text from all fields used to generate the embedding';
COMMENT ON INDEX idx_store_embeddings_vector_ivfflat IS 'IVFFlat index for fast cosine similarity search';

