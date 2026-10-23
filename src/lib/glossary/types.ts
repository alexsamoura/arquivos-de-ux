export const CATEGORIES = [
  "Pesquisa",
  "Arquitetura da Informação",
  "Interação",
  "Prototipação",
  "Estratégia",
  "Times & Métodos",
  "Design Visual",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/**
 * Gaveta do arquivo: um trecho contínuo do alfabeto, calculado a partir dos
 * termos para que nenhuma gaveta passe de `MAX_FOLDERS_PER_STACK`.
 */
export interface Drawer {
  id: string;
  /** Etiqueta da gaveta: "A–C", "M", ou "Pa–Pe" quando uma letra ocupa mais de uma gaveta. */
  label: string;
  /** Primeira e última letra da gaveta, em minúscula e sem acento. */
  from: string;
  to: string;
}

export type DrawerId = Drawer["id"];

/** Máximo de pastas exibidas numa pilha. */
export const MAX_FOLDERS_PER_STACK = 15;

export interface Term {
  id: string;
  /** Posição no arquivo em ordem alfabética, começando em 1. */
  number: number;
  name: string;
  /** Outros nomes do termo (inglês, siglas, variações), usados também na busca. */
  synonyms: string[];
  definition: string;
  /** Situação concreta em que o termo aparece. */
  example: string;
  /** Pista para fixar o significado. */
  tip: string;
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
