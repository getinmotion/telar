-- Create artisan shops table
CREATE TABLE public.artisan_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_name TEXT NOT NULL,
  shop_slug TEXT UNIQUE NOT NULL,
  description TEXT,
  story TEXT,
  logo_url TEXT,
  banner_url TEXT,
  craft_type TEXT,
  region TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  seo_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.artisan_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  subcategory TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  inventory INTEGER DEFAULT 0,
  sku TEXT,
  weight DECIMAL(8,2),
  dimensions JSONB,
  materials JSONB DEFAULT '[]'::jsonb,
  techniques JSONB DEFAULT '[]'::jsonb,
  production_time TEXT,
  customizable BOOLEAN DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  seo_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.artisan_shops(id),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'COP',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  tracking_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artisan analytics table
CREATE TABLE public.artisan_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.artisan_shops(id),
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  products_added INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artisan_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for artisan_shops
CREATE POLICY "Shop owners can manage their shops" 
ON public.artisan_shops 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active shops" 
ON public.artisan_shops 
FOR SELECT 
USING (active = true);

-- Create RLS policies for products
CREATE POLICY "Shop owners can manage their products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.artisan_shops 
    WHERE artisan_shops.id = products.shop_id 
    AND artisan_shops.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view active products from active shops" 
ON public.products 
FOR SELECT 
USING (
  active = true 
  AND EXISTS (
    SELECT 1 FROM public.artisan_shops 
    WHERE artisan_shops.id = products.shop_id 
    AND artisan_shops.active = true
  )
);

-- Create RLS policies for orders
CREATE POLICY "Shop owners can view their orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.artisan_shops 
    WHERE artisan_shops.id = orders.shop_id 
    AND artisan_shops.user_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can update their orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.artisan_shops 
    WHERE artisan_shops.id = orders.shop_id 
    AND artisan_shops.user_id = auth.uid()
  )
);

-- Create RLS policies for analytics
CREATE POLICY "Shop owners can view their analytics" 
ON public.artisan_analytics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.artisan_shops 
    WHERE artisan_shops.id = artisan_analytics.shop_id 
    AND artisan_shops.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_artisan_shops_user_id ON public.artisan_shops(user_id);
CREATE INDEX idx_artisan_shops_slug ON public.artisan_shops(shop_slug);
CREATE INDEX idx_products_shop_id ON public.products(shop_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_analytics_shop_date ON public.artisan_analytics(shop_id, date);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Create trigger for updated_at
CREATE TRIGGER update_artisan_shops_updated_at
  BEFORE UPDATE ON public.artisan_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();