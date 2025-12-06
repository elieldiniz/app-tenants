
DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_batches;
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_logs;
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_documents;
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;
