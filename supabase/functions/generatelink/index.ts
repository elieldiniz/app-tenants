import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("➡️ Nova requisição recebida:", req.method);

  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Apenas POST permitido
  if (req.method !== "POST") {
    return new Response("Método não permitido", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    console.log("📥 Lendo body da requisição...");
    const { lote_id } = await req.json();
    console.log("🔎 lote_id recebido:", lote_id);

    // Validação
    if (!lote_id || typeof lote_id !== "string" || lote_id.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "lote_id obrigatório e deve ser string válida",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // -----------------------------------------------------
    // SUPABASE CLIENT
    // -----------------------------------------------------
    const supabaseUrl = Deno.env.get("supabase_url");
    const serviceRole = Deno.env.get("server_role");

    console.log("🔧 ENV supabase_url:", supabaseUrl);
    console.log(
      "🔧 ENV server_role (service role):",
      serviceRole ? "OK" : "NÃO DEFINIDO",
    );

    if (!supabaseUrl || !serviceRole) {
      return new Response(
        JSON.stringify({
          error: "Variáveis de ambiente supabase_url ou server_role ausentes.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    // -----------------------------------------------------
    // GERA TOKEN
    // -----------------------------------------------------
    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    console.log("🔐 Token gerado:", token);

    console.log("📝 Inserindo token no banco...");
    const { error } = await supabase.from("tokens_de_download").insert({
      lote_id,
      token,
      // sem expires_at
    });

    if (error) {
      console.error("❌ Erro ao inserir token no banco:", error);
      return new Response(JSON.stringify({ error: "Falha ao gerar token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // -----------------------------------------------------
    // GERA LINK
    // -----------------------------------------------------
    const projectUrl = Deno.env.get("supabase_url");
    console.log("🔧 ENV project_url:", projectUrl);

    if (!projectUrl) {
      return new Response(
        JSON.stringify({
          error: "Variável PROJECT_URL não definida.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const link = `https://${projectUrl}/functions/v1/download?token=${token}`;
    console.log("🔗 Link gerado:", link);

    return new Response(JSON.stringify({ link }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ ERRO INTERNO:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
