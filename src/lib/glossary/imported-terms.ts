import rawNewTerms from "../../../termos-novos.json";
import { isCategory, type Category } from "./types";

/**
 * Termos novos de `termos-novos.json` (instruções em `termos-leia-me.md`).
 * O campo `fonte` é só controle interno e não entra no app.
 */
interface NewTermEntry {
  termo: string;
  sinonimos: string[];
  categoria: string;
  definicao: string;
  exemplo: string;
  dica: string;
  fonte: string;
}

export interface ImportedTerm {
  id: string;
  name: string;
  synonyms: string[];
  category: Category;
  definition: string;
  example: string;
  tip: string;
}

/**
 * Termos novos que já existem no app, pelo id do termo do app. Fica a versão do
 * app; do termo novo entram só o nome e os sinônimos, como sinônimos.
 *
 * "Avaliação heurística" e "Fidelidade" não estão aqui de propósito: são
 * conceitos diferentes de "Heurísticas de Nielsen" (os princípios, não o método)
 * e de "Lo-fi" (só um dos níveis de fidelidade). Os sinônimos ligam os pares na busca.
 */
const ALREADY_IN_APP: Record<string, string> = {
  Sitemap: "sitemap",
  Stakeholder: "stakeholder",
  Storyboard: "storyboard",
  "Teste A/B": "teste-ab",
  "Teste de usabilidade": "teste-de-usabilidade",
  Wireframe: "wireframe",
  Feedback: "feedback",
  "User flow": "fluxo-de-usuario",
  "System Usability Scale": "sus",
};

/** Sinônimos para termos que já existem no app, da tabela do leia-me. */
const SYNONYMS_FOR_APP_TERMS: Record<string, string[]> = {
  benchmarking: ["Benchmark", "Competitive audit", "Auditoria competitiva"],
  "affinity-diagram": ["Diagrama de afinidade"],
  "customer-journey-map": ["Jornada do usuário", "User journey"],
  mvp: ["Produto Mínimo Viável", "Minimum Viable Product"],
  "mapa-de-empatia": ["Empathy map", "Aggregated empathy map", "Mapa da empatia"],
  persona: ["Avatar"],
  "desk-research": ["Pesquisa secundária", "Secondary research"],
  "proposta-de-valor": ["Value proposition"],
  "modelo-mental": ["Mental model", "Mental models"],
  acessibilidade: ["Accessibility"],
  "call-to-action": ["CTA", "Call-to-action"],
  "design-sprint": ["Sprint brief"],
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Separa os termos novos dos que já existem no app e junta os sinônimos de cada
 * termo do app. Falha cedo se o arquivo trouxer uma categoria desconhecida ou um
 * id repetido, em vez de deixar um termo sumir em silêncio.
 */
export function importNewTerms(appTermIds: Set<string>) {
  const entries = rawNewTerms as NewTermEntry[];
  const synonymsByAppId = new Map<string, string[]>(
    Object.entries(SYNONYMS_FOR_APP_TERMS).map(([id, synonyms]) => [id, [...synonyms]]),
  );
  const terms: ImportedTerm[] = [];
  const usedIds = new Set(appTermIds);

  for (const entry of entries) {
    const appId = ALREADY_IN_APP[entry.termo];
    if (appId) {
      if (!appTermIds.has(appId)) throw new Error(`Termo do app não encontrado para "${entry.termo}": ${appId}`);
      synonymsByAppId.set(appId, [...(synonymsByAppId.get(appId) ?? []), entry.termo, ...entry.sinonimos]);
      continue;
    }

    if (!isCategory(entry.categoria)) throw new Error(`Categoria desconhecida em "${entry.termo}": ${entry.categoria}`);
    const id = slugify(entry.termo);
    if (usedIds.has(id)) throw new Error(`Id repetido ao importar "${entry.termo}": ${id}`);
    usedIds.add(id);

    terms.push({
      id,
      name: entry.termo,
      synonyms: entry.sinonimos,
      category: entry.categoria,
      definition: entry.definicao,
      example: entry.exemplo,
      tip: entry.dica,
    });
  }

  return { terms, synonymsByAppId };
}
