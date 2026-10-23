import type { Category, ProgressMap, Term } from "./types";

export interface GlossaryFilters {
  query: string;
  category: Category | null;
  onlyReview: boolean;
}

export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Busca no nome, nos sinônimos (inglês, siglas, variações) e na definição. */
export function filterTerms(terms: Term[], progress: ProgressMap, filters: GlossaryFilters) {
  const query = normalize(filters.query);
  return terms.filter((term) => {
    if (filters.category && term.category !== filters.category) return false;
    if (filters.onlyReview && !progress[term.id]?.review) return false;
    if (!query) return true;
    return (
      normalize(term.name).includes(query) ||
      term.synonyms.some((synonym) => normalize(synonym).includes(query)) ||
      normalize(term.definition).includes(query)
    );
  });
}
