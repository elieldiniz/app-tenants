// /functions/whatsapp-webhook/index.ts

import "@jsr:@supabase/functions-js";
import { serve } from "@std/http";
import { createClient } from "@supabase/supabase-js";

serve(async (req: Request) => {
  console.log("🔵 [WEBHOOK] Início do processamento...");

  let body;

  // ===========================
  // 1. Ler JSON recebido
  // ===========================
  try {
    body = await req.json();
    console.log("📩 JSON recebido:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("❌ Erro ao ler JSON:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    instanceId,
    status,
    ids,
    momment,
    phoneDevice,
    phone,
    type,
    isGroup,
  } = body;

  // ===========================
  // 2. Processamento do campo ids
  // ===========================
  const z_api_message_id = Array.isArray(ids) ? ids[0] : ids ?? null;

  console.log("🟣 z_api_message_id:", z_api_message_id);

  // ===========================
  // 3. Ler Env
  // ===========================
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  console.log("🌎 SUPABASE_URL:", url ? "OK" : "MISSING");
  console.log("🔑 SERVICE_ROLE_KEY:", key ? "OK" : "MISSING");

  if (!url || !key) {
    console.error("❌ Credenciais ausentes!");
    return new Response("Supabase credentials missing", { status: 500 });
  }

  const supabase = createClient(url, key);

  // ===========================
  // 4. Montando payload do banco
  // ===========================
  const payload = {
    instance_id: instanceId,
    status,
    ids, // jsonb
    momment, // bigint
    phone_device: phoneDevice,
    phone,
    event_type: type,
    is_group: isGroup,
    raw_data: body,
  };

  console.log("🗂️ Payload para o banco:", JSON.stringify(payload, null, 2));

  // ===========================
  // 5. Inserir no Supabase
  // ===========================
  const { error, data } = await supabase
    .from("whatsapp_status_send")
    .insert(payload)
    .select();

  if (error) {
    console.error("❌ Erro ao inserir no Supabase:", error);
    return new Response(
      JSON.stringify(
        {
          message: "DB error",
          supabase_error: error,
        },
        null,
        2
      ),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log("✅ Inserção concluída:", data);

  return new Response("OK", { status: 200 });
});
