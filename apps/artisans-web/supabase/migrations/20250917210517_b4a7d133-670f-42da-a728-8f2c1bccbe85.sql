-- Check if storage policies exist and create comprehensive storage policies for images bucket

-- Allow authenticated users to view all objects in images bucket
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload to their own folder in images bucket  
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL AND auth.uid()::text = owner_id::text);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own images"  
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL AND auth.uid()::text = owner_id::text);