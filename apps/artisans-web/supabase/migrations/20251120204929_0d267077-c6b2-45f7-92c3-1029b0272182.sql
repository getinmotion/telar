-- Verificar y crear bucket hero-images si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política de INSERT para usuarios autenticados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload hero images'
  ) THEN
    CREATE POLICY "Users can upload hero images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'hero-images');
  END IF;
END $$;

-- Política de SELECT pública
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Hero images are publicly accessible'
  ) THEN
    CREATE POLICY "Hero images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'hero-images');
  END IF;
END $$;