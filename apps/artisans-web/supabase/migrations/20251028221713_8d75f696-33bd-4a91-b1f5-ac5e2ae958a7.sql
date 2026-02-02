-- Crear bucket para assets de marca (logos, imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuarios autenticados pueden subir archivos a su propia carpeta
CREATE POLICY "Users can upload their own brand assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuarios autenticados pueden actualizar sus propios archivos
CREATE POLICY "Users can update their own brand assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Todos pueden ver los archivos (bucket público)
CREATE POLICY "Public access to brand assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Política: Usuarios pueden eliminar sus propios archivos
CREATE POLICY "Users can delete their own brand assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);