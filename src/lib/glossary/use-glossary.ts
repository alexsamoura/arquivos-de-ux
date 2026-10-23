"use client";

import { useCallback, useEffect, useState } from "react";
import { glossaryRepository } from "./repository";
import { EMPTY_PROGRESS, type ProgressMap, type Term, type TermProgress } from "./types";

export function useGlossary() {
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    let active = true;
    Promise.all([glossaryRepository.listTerms(), glossaryRepository.getProgress()]).then(
      ([loadedTerms, loadedProgress]) => {
        if (!active) return;
        setTerms(loadedTerms);
        setProgress(loadedProgress);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const updateProgress = useCallback(
    (termId: string, patch: Partial<TermProgress>) => {
      // Atualização otimista: a tela muda na hora e o repositório grava em seguida.
      const next = { ...EMPTY_PROGRESS, ...progress[termId], ...patch };
      setProgress((current) => ({ ...current, [termId]: next }));
      void glossaryRepository.saveProgress(termId, next);
    },
    [progress],
  );

  return { terms, progress, updateProgress, loading: terms === null };
}
