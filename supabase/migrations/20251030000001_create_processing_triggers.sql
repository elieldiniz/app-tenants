
CREATE OR REPLACE FUNCTION public.broadcast_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'processing-logs',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_broadcast_logs
  AFTER INSERT OR UPDATE ON public.processing_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_log_changes();

-- Função para emitir eventos de lotes
CREATE OR REPLACE FUNCTION public.broadcast_batch_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'processing-batch',
    'UPDATE',
    'UPDATE',
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_broadcast_batch
  AFTER UPDATE ON public.processing_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_batch_changes();

-- Função para emitir eventos de documentos
CREATE OR REPLACE FUNCTION public.broadcast_document_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'processing-documents',
    'INSERT',
    'INSERT',
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    NULL
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_broadcast_document
  AFTER INSERT ON public.processing_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_document_changes();
