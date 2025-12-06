import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

import JSZip from "https://esm.sh/jszip";

serve(async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("supabase_url"),
    Deno.env.get("server_role")
  );

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Token ausente", { status: 400 });
  }

  // 1. Validar token
  const { data: tokenRow } = await supabase
    .from("tokens_de_download")
    .select("lote_id")
    .eq("token", token)
    .single();

  if (!tokenRow) {
    return new Response("Token inválido", { status: 401 });
  }

  const lote_id = tokenRow.lote_id;

  // 2. Buscar todos documentos
  const { data: docs, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("lote_id", lote_id);

  if (error || !docs || docs.length === 0) {
    return new Response("Nenhum documento encontrado", { status: 404 });
  }

  // 3. Se houver apenas 1 documento → retornar direto
  if (docs.length === 1) {
    const doc = docs[0];

    const { data: file, error: fileErr } = await supabase.storage
      .from("documentos")
      .download(doc.caminho);

    if (fileErr) {
      return new Response("Falha ao baixar arquivo", { status: 500 });
    }

    return new Response(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${doc.nome_arquivo}"`,
      },
    });
  }

  // 4. Se houver mais de 1 → criar ZIP em memória
  const zip = new JSZip();

  for (const doc of docs) {
    const { data: file } = await supabase.storage
      .from("documentos")
      .download(doc.caminho);

    const arrayBuffer = await file.arrayBuffer();

    zip.file(doc.nome_arquivo, arrayBuffer);
  }

  const zipFile = await zip.generateAsync({ type: "uint8array" });

  return new Response(zipFile, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="lote-${lote_id}.zip"`,
    },
  });
});
