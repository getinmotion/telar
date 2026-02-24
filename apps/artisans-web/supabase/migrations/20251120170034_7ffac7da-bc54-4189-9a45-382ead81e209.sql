-- Crear bucket para hero images si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can upload their own hero images" ON storage.objects;
DROP POLICY IF EXISTS "Public hero images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own hero images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own hero images" ON storage.objects;

-- Política: Usuarios autenticados pueden subir imágenes a sus carpetas
CREATE POLICY "Users can upload their own hero images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hero-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Todos pueden ver las imágenes (bucket público)
CREATE POLICY "Public hero images are viewable by everyone"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hero-images');

-- Política: Usuarios pueden actualizar sus propias imágenes
CREATE POLICY "Users can update their own hero images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hero-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuarios pueden eliminar sus propias imágenes
CREATE POLICY "Users can delete their own hero images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hero-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);