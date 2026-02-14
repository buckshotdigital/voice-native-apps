-- Storage policies for app-assets bucket
-- Allow authenticated users to upload files to their own folder (userId/*)
CREATE POLICY "auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own files
CREATE POLICY "auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access for app-assets (logos, screenshots)
CREATE POLICY "public_read_app_assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'app-assets');
