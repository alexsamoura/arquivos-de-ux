import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lidas por nome completo para o Next embutir os valores no bundle do navegador.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

/**
 * Cliente do Supabase com a chave publicável: só leitura, pelas políticas de RLS
 * da tabela `termos`. O app não tem login, então não guarda sessão.
 */
export function getSupabase() {
  if (!url || !publishableKey) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local.");
  }
  client ??= createClient(url, publishableKey, { auth: { persistSession: false } });
  return client;
}
