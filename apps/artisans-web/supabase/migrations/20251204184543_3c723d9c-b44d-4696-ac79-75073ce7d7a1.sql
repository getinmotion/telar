-- Create storage bucket for artisan profile assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artisan-profiles',
  'artisan-profiles',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for artisan-profiles bucket
CREATE POLICY "Artisan profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'artisan-profiles');

CREATE POLICY "Users can upload their own artisan profile assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artisan-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own artisan profile assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artisan-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own artisan profile assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artisan-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);