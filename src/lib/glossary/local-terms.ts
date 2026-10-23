import { normalize } from "./filters";
import { importNewTerms } from "./imported-terms";
import { MOCK_TERM_DETAILS } from "./mock-term-details";
import { MOCK_TERMS } from "./mock-terms";
import type { Category } from "./types";

/**
 * Termos locais (os 48 originais + os de `termos-novos.json`), só como backup e
 * para gerar `supabase/seed.sql`. O app lê os termos do Supabase, não daqui.
 */
export interface LocalTerm {
  name: string;
  synonyms: string[];
  category: Category;
  definition: string;
  example: string;
  tip: string;
  /** Controle interno do arquivo importado; os 48 originais não têm fonte. */
  source: string | null;
}

/** Sinônimos sem repetição e sem o próprio nome, ignorando caixa e acento. */
function uniqueSynonyms(name: string, synonyms: string[]) {
  const seen = new Set([normalize(name)]);
  return synonyms.filter((synonym) => {
    const key = normalize(synonym);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Mesma montagem que o app usava antes do Supabase, em ordem alfabética. */
export function buildLocalTerms(): LocalTerm[] {
  const { terms: importedTerms, synonymsByAppId } = importNewTerms(new Set(MOCK_TERMS.map((seed) => seed.id)));

  const appTerms: LocalTerm[] = MOCK_TERMS.map((seed) => {
    const details = MOCK_TERM_DETAILS[seed.id];
    if (!details) throw new Error(`Termo mock sem exemplo e dica: ${seed.id}`);
    return {
      name: seed.name,
      synonyms: synonymsByAppId.get(seed.id) ?? [],
      category: seed.category,
      definition: seed.definition,
      example: details.example,
      tip: details.tip,
      source: null,
    };
  });

  const imported: LocalTerm[] = importedTerms.map((term) => ({
    name: term.name,
    synonyms: term.synonyms,
    category: term.category,
    definition: term.definition,
    example: term.example,
    tip: term.tip,
    source: term.source,
  }));

  return [...appTerms, ...imported]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((term) => ({ ...term, synonyms: uniqueSynonyms(term.name, term.synonyms) }));
}
