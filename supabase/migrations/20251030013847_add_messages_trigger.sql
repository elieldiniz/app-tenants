-- Função que emite eventos para o canal "topic:<id>"
CREATE OR REPLACE FUNCTION public.messages_changes()
RETURNS trigger
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'topic:' || NEW.id::text,  -- nome do canal
    TG_OP,                     -- operação: INSERT, UPDATE, DELETE
    TG_OP,                     -- tipo de evento
    TG_TABLE_NAME,             -- tabela
    TG_TABLE_SCHEMA,           -- schema
    NEW,                       -- registro novo
    OLD                        -- registro antigo
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Gatilho para emitir eventos após alterações na tabela "messages"
CREATE TRIGGER broadcast_changes_for_messages_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.messages_changes();