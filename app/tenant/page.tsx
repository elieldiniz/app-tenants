"use client";

import { useState } from "react";
import { InfoIcon, Terminal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  useRealtimeLogs,
  ProcessingLog,
  BatchStatus,
  DocumentProcessed,
} from "./useRealtimeLogs";

const supabase = createClient();

export default function ProcessamentoDinamicoPage() {
  const [executando, setExecutando] = useState(false);
  const { logs, batchStatus, documents, isConnected } = useRealtimeLogs();

  // Simulação de empresas, etapas e documentos
  const empresas = [
    "SolarTech",
    "EcoVolt",
    "GreenHouse",
    "Energia Pura",
    "BlueSun",
  ];
  const etapas = [
    "🔌 Conectando",
    "📦 Buscando dados",
    "⚙️ Processando lote",
    "✅ Finalizado",
  ];
  const tiposDocs = ["Relatório", "Fatura", "Checklist"];

  // Cria um batch válido
  const criarBatch = async () => {
    console.log(
      "%c[DEBUG] Criando batch...",
      "color: blue; font-weight: bold;"
    );
    const { data, error } = await supabase
      .from("processing_batches")
      .insert({
        batch_name: "Simulação de Processamento",
        document_types: tiposDocs,
        total_companies: empresas.length,
        processed_companies: 0,
        status: "Processando",
      })
      .select()
      .single();

    if (error) {
      console.error(
        "%c[DEBUG] Erro ao criar batch:",
        "color: red; font-weight: bold;",
        error
      );
      return null;
    }
    console.log(
      "%c[DEBUG] Batch criado com sucesso:",
      "color: green; font-weight: bold;",
      data
    );
    return data.id;
  };

  const iniciarProcessamento = async () => {
    if (executando) return;
    setExecutando(true);

    const batchId = await criarBatch();
    if (!batchId) {
      setExecutando(false);
      return;
    }

    console.log(
      "%c[DEBUG] Iniciando processamento do batch:",
      "color: purple; font-weight: bold;",
      batchId
    );

    for (const empresa of empresas) {
      for (const etapa of etapas) {
        const tenantId = crypto.randomUUID();
        const companyId = crypto.randomUUID();

        // 1️⃣ Inserir log
        console.log(`[DEBUG] Inserindo log: [${empresa}] ${etapa}`);
        const { error: logError } = await supabase
          .from("processing_logs")
          .insert({
            batch_id: batchId,
            tenant_id: tenantId,
            company_id: companyId,
            message: `[${empresa}] ${etapa}`,
            action: "processamento",
            status: "success",
          });
        if (logError)
          console.error(
            "%c[DEBUG] Erro ao inserir log:",
            "color: red;",
            logError
          );

        // 2️⃣ Inserir documento
        const docType = tiposDocs[Math.floor(Math.random() * tiposDocs.length)];
        console.log(`[DEBUG] Inserindo documento: ${empresa}-${docType}`);
        const { error: docError } = await supabase
          .from("processing_documents")
          .insert({
            batch_id: batchId,
            tenant_id: tenantId,
            company_id: companyId,
            document_name: `${empresa}-${docType}`,
            document_type: docType,
            document_path: "/caminho/para/documento.pdf",
            status: "Processado",
          });
        if (docError)
          console.error(
            "%c[DEBUG] Erro ao inserir documento:",
            "color: red;",
            docError
          );

        // Simula tempo real
        await new Promise((r) => setTimeout(r, 800));
      }

      // 3️⃣ Atualizar batch
      const processed_companies = empresas.indexOf(empresa) + 1;
      console.log(
        `[DEBUG] Atualizando batch: ${processed_companies}/${empresas.length} processadas`
      );
      const { error: batchError } = await supabase
        .from("processing_batches")
        .update({
          status:
            processed_companies === empresas.length
              ? "Finalizado"
              : "Processando",
          processed_companies,
        })
        .eq("id", batchId);
      if (batchError)
        console.error(
          "%c[DEBUG] Erro ao atualizar batch:",
          "color: red;",
          batchError
        );

      await new Promise((r) => setTimeout(r, 500));
    }

    console.log(
      "%c[DEBUG] Processamento finalizado!",
      "color: green; font-weight: bold;"
    );
    setExecutando(false);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-blue-50 text-blue-800 text-sm p-3 px-5 rounded-md flex gap-3 items-center">
        <InfoIcon size={16} />
        🧠 Simulador Dinâmico — logs, batches e documentos em tempo real.
      </div>

      <button
        onClick={iniciarProcessamento}
        disabled={executando}
        className={`px-6 py-2 rounded-lg text-white font-medium ${
          executando ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {executando ? "Executando..." : "Iniciar Processamento"}
      </button>

      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-900 text-green-400 font-mono max-h-64 overflow-y-auto">
          <div className="flex items-center gap-2 text-green-300 mb-2">
            <Terminal size={16} />
            <span>Logs em tempo real</span>
          </div>
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum log encontrado...</p>
          ) : (
            logs.map((log: ProcessingLog) => (
              <div key={log.id} className="flex justify-between">
                <span>{log.message}</span>
                <span
                  className={`font-bold ${
                    log.status === "success" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ({log.status})
                </span>
              </div>
            ))
          )}
        </div>

        {batchStatus && (
          <div className="border rounded-lg p-4 bg-gray-800 text-yellow-300 font-mono">
            <h3 className="text-yellow-400 font-bold mb-2">Batch Status</h3>
            <p>ID: {batchStatus.id}</p>
            <p>Status: {batchStatus.status}</p>
            <p>
              Progresso: {batchStatus.processed_companies}/
              {batchStatus.total_companies}
            </p>
          </div>
        )}

        {documents.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-700 text-blue-300 font-mono max-h-64 overflow-y-auto">
            <h3 className="text-blue-400 font-bold mb-2">Documentos</h3>
            {documents.map((d: DocumentProcessed) => (
              <div key={d.id}>
                {d.document_name} ({d.document_type}) - {d.status}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-400">
        Conexão realtime: {isConnected ? "✅ Conectado" : "❌ Desconectado"}
      </div>
    </div>
  );
}
