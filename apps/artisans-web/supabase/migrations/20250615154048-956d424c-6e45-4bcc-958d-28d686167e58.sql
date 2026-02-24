
-- Create table for site-wide image configurations
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context text NOT NULL,
  key text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (context, key)
);

-- Enable Row Level Security
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active images
CREATE POLICY "Allow public read access to active site images"
ON public.site_images
FOR SELECT
USING (is_active = true);

-- Policy to allow admin full access for management
CREATE POLICY "Allow admin full access to site images"
ON public.site_images
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create a trigger to update the 'updated_at' column on change
CREATE TRIGGER handle_site_images_updated_at
BEFORE UPDATE ON public.site_images
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();

-- Pre-populate with existing images from the Hero section
INSERT INTO public.site_images (context, key, image_url, alt_text)
VALUES
  ('hero', 'slide1', '/lovable-uploads/9a2715d7-552b-4658-9c27-78866aaea8b4.png', 'GET IN MOTION Platform for Creative Artists'),
  ('hero', 'slide2', '/lovable-uploads/d9c1ecec-d8c1-4917-ac32-9dd8e20d33b0.png', 'AI-Powered Creative Tools'),
  ('hero', 'slide3', '/lovable-uploads/9a2715d7-552b-4658-9c27-78866aaea8b4.png', 'Join Creative Community')
ON CONFLICT (context, key) DO NOTHING;
