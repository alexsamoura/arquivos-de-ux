import { getSupabase } from "@/lib/supabase/client";
import { termIdFor } from "./term-id";
import { EMPTY_PROGRESS, isCategory, type ProgressMap, type Term, type TermProgress } from "./types";

/**
 * Contrato de acesso aos dados do glossário. Os componentes dependem só desta
 * interface: os termos vêm do Supabase, e o progresso de estudo fica no navegador.
 */
export interface GlossaryRepository {
  listTerms(): Promise<Term[]>;
  getProgress(): Promise<ProgressMap>;
  saveProgress(termId: string, progress: TermProgress): Promise<TermProgress>;
}

const STORAGE_KEY = "glossario-ux:progresso";

/** Linha da tabela `public.termos`, só com as colunas que o app usa. */
interface TermRow {
  termo: string;
  sinonimos: string[] | null;
  categoria: string;
  definicao: string;
  exemplo: string | null;
  dica: string | null;
}

function readStoredProgress(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeStoredProgress(progress: ProgressMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Sem armazenamento disponível: o progresso vale só nesta sessão.
  }
}

/**
 * Converte as linhas do banco em termos do app, em ordem alfabética. O id vem do
 * nome (não do uuid do banco), porque é por ele que o progresso está salvo.
 */
function toTerms(rows: TermRow[]): Term[] {
  return rows
    .filter((row) => {
      if (isCategory(row.categoria)) return true;
      console.warn(`Termo ignorado, categoria desconhecida: "${row.termo}" (${row.categoria})`);
      return false;
    })
    .sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"))
    .map((row, index) => ({
      id: termIdFor(row.termo),
      number: index + 1,
      name: row.termo,
      synonyms: row.sinonimos ?? [],
      category: row.categoria as Term["category"],
      definition: row.definicao,
      example: row.exemplo ?? "",
      tip: row.dica ?? "",
    }));
}

async function fetchTerms() {
  const { data, error } = await getSupabase()
    .from("termos")
    .select("termo, sinonimos, categoria, definicao, exemplo, dica");
  if (error) throw new Error(error.message);
  return toTerms((data ?? []) as TermRow[]);
}

function createRepository(): GlossaryRepository {
  let memoryProgress: ProgressMap | null = null;
  // A primeira busca é reaproveitada (inclusive quando o React monta duas vezes em
  // desenvolvimento), para o app fazer um único SELECT. Só depois de uma falha
  // uma nova chamada busca de novo.
  let termsRequest: Promise<Term[]> | null = null;

  return {
    /** Um único SELECT ao carregar o app; busca, filtros e gavetas rodam sobre o resultado. */
    listTerms() {
      termsRequest ??= fetchTerms().catch((reason: unknown) => {
        termsRequest = null;
        throw reason;
      });
      return termsRequest;
    },
    async getProgress() {
      memoryProgress ??= readStoredProgress();
      return { ...memoryProgress };
    },
    async saveProgress(termId, progress) {
      memoryProgress ??= readStoredProgress();
      memoryProgress = { ...memoryProgress, [termId]: { ...EMPTY_PROGRESS, ...progress } };
      writeStoredProgress(memoryProgress);
      return memoryProgress[termId];
    },
  };
}

export const glossaryRepository: GlossaryRepository = createRepository();
