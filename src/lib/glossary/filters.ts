import { RANGES, type Category, type ProgressMap, type RangeId, type Term } from "./types";

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

export function rangeOf(term: Term): RangeId {
  const first = normalize(term.name).charAt(0);
  const range = RANGES.find((r) => first >= r.from && first <= r.to);
  return range?.id ?? RANGES[0].id;
}

export function filterTerms(terms: Term[], progress: ProgressMap, filters: GlossaryFilters) {
  const query = normalize(filters.query);
  return terms.filter((term) => {
    if (filters.category && term.category !== filters.category) return false;
    if (filters.onlyReview && !progress[term.id]?.review) return false;
    if (!query) return true;
    return normalize(term.name).includes(query) || normalize(term.definition).includes(query);
  });
}

export function groupByRange(terms: Term[]) {
  const groups = Object.fromEntries(RANGES.map((r) => [r.id, [] as Term[]])) as Record<RangeId, Term[]>;
  for (const term of terms) groups[rangeOf(term)].push(term);
  return groups;
}

/** Formata números com zeros à esquerda: 4 → "04", 12 → "012" com width 3. */
export function pad(value: number, width = 2) {
  return String(value).padStart(width, "0");
}
