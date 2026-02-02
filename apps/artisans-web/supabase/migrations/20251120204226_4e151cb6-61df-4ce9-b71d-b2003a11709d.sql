-- Verificar y crear políticas RLS para el bucket hero-images

-- Crear política de INSERT si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload hero images'
  ) THEN
    CREATE POLICY "Users can upload hero images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'hero-images');
  END IF;
END $$;

-- Crear política de SELECT pública si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Hero images are publicly accessible'
  ) THEN
    CREATE POLICY "Hero images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'hero-images');
  END IF;
END $$;