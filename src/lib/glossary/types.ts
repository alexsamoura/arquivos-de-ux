export const CATEGORIES = [
  "Pesquisa",
  "Arquitetura da Informação",
  "Interação",
  "Prototipação",
  "Estratégia",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const RANGES = [
  { id: "a-c", label: "A–C", from: "a", to: "c" },
  { id: "d-l", label: "D–L", from: "d", to: "l" },
  { id: "m-r", label: "M–R", from: "m", to: "r" },
  { id: "s-z", label: "S–Z", from: "s", to: "z" },
] as const;

export type RangeId = (typeof RANGES)[number]["id"];

/** Máximo de pastas exibidas numa pilha. */
export const MAX_FOLDERS_PER_STACK = 15;

export interface Term {
  id: string;
  /** Posição no arquivo em ordem alfabética, começando em 1. */
  number: number;
  name: string;
  definition: string;
  category: Category;
}

export interface TermProgress {
  /** A definição já foi revelada pelo menos uma vez. */
  seen: boolean;
  /** Marcado para estudar de novo. */
  review: boolean;
}

export type ProgressMap = Record<string, TermProgress>;

export const EMPTY_PROGRESS: TermProgress = { seen: false, review: false };
