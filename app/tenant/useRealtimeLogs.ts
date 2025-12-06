import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface ProcessingLog {
  id: string;
  action: string;
  message: string;
  status: "success" | "error" | "warning";
  created_at: string;
  batch_id: string;
  tenant_id: string;
  company_id: string;
  metadata?: Record<string, unknown>;
}

export interface BatchStatus {
  id: string;
  status: string;
  processed_companies: number;
  total_companies: number;
  batch_name?: string;
  created_at?: string;
}

export interface DocumentProcessed {
  id: string;
  document_name: string;
  document_type: string;
  status: string;
  batch_id: string;
  company_id: string;
  created_at: string;
}

export const useRealtimeLogs = () => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [documents, setDocuments] = useState<DocumentProcessed[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log(
      "%c[useRealtimeLogs] Inicializando canais Realtime...",
      "color: cyan; font-weight: bold;"
    );

    // Canal de logs
    const logsChannel = supabase
      .channel("processing-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "processing_logs" },
        (payload) => {
          const log = payload.new as ProcessingLog;
          setLogs((prev) => [log, ...prev]);
          console.log(
            "%c[Logs] Novo registro recebido via postgres_changes",
            "color: #00ff99",
            log
          );
        }
      )
      .subscribe((status, err) => {
        console.log("%c[Logs] Status do canal:", "color: magenta", status);
        if (err) console.error("%c[Logs] Erro no canal:", "color: red", err);
        setIsConnected(status === "SUBSCRIBED");
      });

    // Canal de batches
    const batchChannel = supabase
      .channel("processing-batches")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "processing_batches" },
        (payload) => {
          const batch = payload.new as BatchStatus;
          setBatchStatus(batch);
          console.log(
            "%c[Batches] Batch atualizado via postgres_changes",
            "color: #ffcc00",
            batch
          );
        }
      )
      .subscribe((status, err) => {
        console.log("%c[Batches] Status do canal:", "color: orange", status);
        if (err) console.error("%c[Batches] Erro no canal:", "color: red", err);
      });

    // Canal de documentos
    const docsChannel = supabase
      .channel("processing-documents")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "processing_documents" },
        (payload) => {
          const doc = payload.new as DocumentProcessed;
          setDocuments((prev) => [doc, ...prev]);
          console.log(
            "%c[Documents] Documento recebido via postgres_changes",
            "color: #0099ff",
            doc
          );
        }
      )
      .subscribe((status, err) => {
        console.log("%c[Documents] Status do canal:", "color: blue", status);
        if (err)
          console.error("%c[Documents] Erro no canal:", "color: red", err);
      });

    // Cleanup
    return () => {
      console.log(
        "%c[useRealtimeLogs] Removendo canais...",
        "color: gray; font-style: italic;"
      );
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(batchChannel);
      supabase.removeChannel(docsChannel);
      setIsConnected(false);
      setLogs([]);
      setBatchStatus(null);
      setDocuments([]);
    };
  }, []);

  return { logs, batchStatus, documents, isConnected };
};
