-- Add local pickup option to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS allows_local_pickup BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.allows_local_pickup IS 
'Indica si el vendedor ofrece retiro en local (pickup gratuito)';