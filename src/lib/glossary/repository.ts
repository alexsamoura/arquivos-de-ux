import { MOCK_TERMS } from "./mock-terms";
import { EMPTY_PROGRESS, type ProgressMap, type Term, type TermProgress } from "./types";

/**
 * Contrato de acesso aos dados do glossário. Os componentes dependem só desta
 * interface; para usar o Supabase, basta criar outra implementação e trocar a
 * exportação `glossaryRepository` no fim do arquivo.
 */
export interface GlossaryRepository {
  listTerms(): Promise<Term[]>;
  getProgress(): Promise<ProgressMap>;
  saveProgress(termId: string, progress: TermProgress): Promise<TermProgress>;
}

const STORAGE_KEY = "glossario-ux:progresso";

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

/** Implementação provisória: termos em memória, progresso no navegador. */
function createMockRepository(): GlossaryRepository {
  let memoryProgress: ProgressMap | null = null;

  const terms: Term[] = [...MOCK_TERMS]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((seed, index) => ({ ...seed, number: index + 1 }));

  return {
    async listTerms() {
      return terms;
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

export const glossaryRepository: GlossaryRepository = createMockRepository();
