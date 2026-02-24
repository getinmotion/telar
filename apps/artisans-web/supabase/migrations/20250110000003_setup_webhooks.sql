-- Create webhook triggers for automatic embedding updates
-- These triggers will call the Supabase Edge Function when shops or products are created/updated

-- Note: Webhooks need to be configured in Supabase Dashboard
-- This migration documents the webhook configuration needed

-- Webhook Configuration Instructions:
-- 
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create webhook for artisan_shops table:
--    - Name: trigger-shop-embedding-update
--    - Table: artisan_shops
--    - Events: INSERT, UPDATE
--    - Type: Edge Function
--    - Edge Function: trigger-embedding-update
--    - HTTP Headers: X-API-Key: <your-fastapi-api-key>
--
-- 3. Create webhook for products table:
--    - Name: trigger-product-embedding-update
--    - Table: products
--    - Events: INSERT, UPDATE
--    - Type: Edge Function
--    - Edge Function: trigger-embedding-update
--    - HTTP Headers: X-API-Key: <your-fastapi-api-key>

-- Alternative: Use pg_net for direct HTTP calls (if webhooks are not available)
-- This requires the pg_net extension

-- Enable pg_net extension (optional, for direct HTTP calls)
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to call FastAPI directly via HTTP (alternative approach)
-- Uncomment this if you prefer direct HTTP calls instead of Edge Functions

/*
CREATE OR REPLACE FUNCTION public.trigger_embedding_update()
RETURNS TRIGGER AS $$
DECLARE
  fastapi_url TEXT := 'http://your-fastapi-backend:8000/embed';
  api_key TEXT := 'your-api-key-here';
  payload JSONB;
BEGIN
  -- Build payload based on table
  IF TG_TABLE_NAME = 'artisan_shops' THEN
    payload := jsonb_build_object(
      'shop_id', NEW.id,
      'product_id', NULL,
      'shop_name', NEW.shop_name,
      'description', NEW.description,
      'story', NEW.story,
      'craft_type', NEW.craft_type,
      'region', NEW.region
    );
  ELSIF TG_TABLE_NAME = 'products' THEN
    -- For products, we need to join with shop data
    -- This is handled by the Edge Function instead
    RETURN NEW;
  END IF;

  -- Make async HTTP request using pg_net
  PERFORM net.http_post(
    url := fastapi_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-API-Key', api_key
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_artisan_shop_change
  AFTER INSERT OR UPDATE ON public.artisan_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_embedding_update();

CREATE TRIGGER on_product_change
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_embedding_update();
*/

-- Add helpful comments
COMMENT ON TABLE public.store_embeddings IS 'Automatically updated via webhooks when artisan_shops or products change';

