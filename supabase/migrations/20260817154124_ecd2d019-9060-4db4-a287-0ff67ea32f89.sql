CREATE POLICY "own files read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'nexora-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'nexora-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'nexora-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);