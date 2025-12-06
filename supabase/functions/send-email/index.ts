import "@jsr:@supabase/functions-js";
import { serve } from "@std/http";
import { createClient } from "@supabase/supabase-js";

console.log("Hello from Functions!");

serve(async (req: Request) => {
  // ====== FIX: valida JSON ======
  let body;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(
      JSON.stringify({ error: "JSON body inválido ou vazio." }),
      { status: 400 }
    );
  }

  const name = body?.name ?? "Usuário";

  // ====== Envio via Z-API ======
  const send = await fetch(
    "https://api.z-api.io/instances/3EAEF7F9D1C4D11C7BA0EE8EC4228045/token/AD1EA5E820081028D728414E/send-text",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": "F16fe249077484657b218c35f413c08eaS",
      },
      body: JSON.stringify({
        phone: "556992171303",
        message: `Olá, ${name}! Mensagem enviada via Z-API.`,
      }),
    }
  );

  const sendData = await send.json().catch(() => null);

  // ====== Supabase ======
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  console.log("Supabase URL:", url);
  console.log("Supabase Key:", key ? "OK" : "NÃO DEFINIDO");

  if (!url || !key) {
    return new Response("Supabase URL or Key not set", { status: 500 });
  }

  const supabase = createClient(url, key);

  await supabase.from("whatsapp_messages").insert({
    message_text: sendData,
    z_api_message_id: sendData?.messageId ?? null,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      enviado: true,
      sendData,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
