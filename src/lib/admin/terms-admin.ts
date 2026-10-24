import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { Category } from "@/lib/glossary/types";

/** Ficha como está na tabela public.termos, com o uuid para editar e apagar. */
export interface AdminTerm {
  id: string;
  termo: string;
  sinonimos: string[];
  categoria: Category;
  definicao: string;
  exemplo: string | null;
  dica: string | null;
  fonte: string | null;
}

export type TermDraft = Omit<AdminTerm, "id">;

const COLUMNS = "id, termo, sinonimos, categoria, definicao, exemplo, dica, fonte";

/** Erros do banco traduzidos; o RLS recusa quem não é admin. */
function toMessage(error: PostgrestError, draft?: TermDraft) {
  if (error.code === "23505") return `Já existe uma ficha chamada "${draft?.termo ?? ""}".`;
  if (error.code === "23514") return "Categoria inválida.";
  if (error.code === "42501") return "Sua conta não tem permissão para alterar o arquivo.";
  return `Não foi possível salvar: ${error.message}`;
}

export async function listAdminTerms(): Promise<AdminTerm[]> {
  const { data, error } = await getSupabase().from("termos").select(COLUMNS);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AdminTerm[]).sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));
}

/** Cada função devolve `null` se deu certo, ou a mensagem de erro para mostrar. */
export async function createTerm(draft: TermDraft): Promise<string | null> {
  const { error } = await getSupabase().from("termos").insert(draft);
  return error ? toMessage(error, draft) : null;
}

export async function updateTerm(id: string, draft: TermDraft): Promise<string | null> {
  const { data, error } = await getSupabase().from("termos").update(draft).eq("id", id).select("id");
  if (error) return toMessage(error, draft);
  // Sem permissão, o RLS não dá erro: só não encontra a linha.
  return data && data.length > 0 ? null : "Sua conta não tem permissão para alterar o arquivo.";
}

export async function deleteTerm(id: string): Promise<string | null> {
  const { data, error } = await getSupabase().from("termos").delete().eq("id", id).select("id");
  if (error) return toMessage(error);
  return data && data.length > 0 ? null : "Sua conta não tem permissão para apagar fichas.";
}
