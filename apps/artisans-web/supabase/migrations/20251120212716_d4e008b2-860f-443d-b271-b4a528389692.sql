-- Crear bucket para imágenes de hero sliders
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Public read access for hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Política para permitir a usuarios autenticados subir sus propias imágenes
CREATE POLICY "Authenticated users can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir a usuarios autenticados actualizar sus propias imágenes
CREATE POLICY "Authenticated users can update their hero images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-images' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir a usuarios autenticados eliminar sus propias imágenes
CREATE POLICY "Authenticated users can delete their hero images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-images' 
  AND auth.uid() IS NOT NULL
);