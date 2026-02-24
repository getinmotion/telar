-- Create product_categories table for hierarchical categories
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories
CREATE POLICY "Public can view active categories"
ON public.product_categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Shop owners can manage categories for their products"
ON public.product_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.artisan_shops
    WHERE user_id = auth.uid()
  )
);

-- Create cart_items table for shopping cart functionality
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart_items
CREATE POLICY "Users can manage their own cart items"
ON public.cart_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can manage cart by session"
ON public.cart_items
FOR ALL
USING (user_id IS NULL);

-- Add category_id to products table
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_product_categories_parent_id ON public.product_categories(parent_id);
CREATE INDEX idx_product_categories_slug ON public.product_categories(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON public.cart_items(session_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories
INSERT INTO public.product_categories (name, slug, description, display_order) VALUES
('Textiles', 'textiles', 'Productos textiles artesanales como ropa, bolsos y accesorios', 1),
('Cerámica', 'ceramica', 'Productos de cerámica y alfarería tradicional', 2),
('Joyería', 'joyeria', 'Joyas y accesorios artesanales', 3),
('Madera', 'madera', 'Productos tallados en madera y carpintería artesanal', 4),
('Decoración', 'decoracion', 'Artículos decorativos para el hogar', 5),
('Arte', 'arte', 'Obras de arte y pinturas originales', 6);

-- Insert subcategories for Textiles
INSERT INTO public.product_categories (name, slug, description, parent_id, display_order) VALUES
('Ropa', 'ropa', 'Prendas de vestir artesanales', 
  (SELECT id FROM public.product_categories WHERE slug = 'textiles'), 1),
('Bolsos', 'bolsos', 'Bolsos y carteras artesanales', 
  (SELECT id FROM public.product_categories WHERE slug = 'textiles'), 2),
('Accesorios Textiles', 'accesorios-textiles', 'Bufandas, gorros y otros accesorios', 
  (SELECT id FROM public.product_categories WHERE slug = 'textiles'), 3);

-- Insert subcategories for Cerámica
INSERT INTO public.product_categories (name, slug, description, parent_id, display_order) VALUES
('Vajillas', 'vajillas', 'Platos, tazas y utensilios de cerámica', 
  (SELECT id FROM public.product_categories WHERE slug = 'ceramica'), 1),
('Macetas', 'macetas', 'Macetas y contenedores para plantas', 
  (SELECT id FROM public.product_categories WHERE slug = 'ceramica'), 2),
('Figuras Decorativas', 'figuras-decorativas', 'Esculturas y figuras de cerámica', 
  (SELECT id FROM public.product_categories WHERE slug = 'ceramica'), 3);