"use client";

import { useCallback, useEffect, useState } from "react";
import { glossaryRepository } from "./repository";
import { EMPTY_PROGRESS, type ProgressMap, type Term, type TermProgress } from "./types";

export type GlossaryStatus = "loading" | "error" | "ready";

export function useGlossary() {
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [status, setStatus] = useState<GlossaryStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  // Cada tentativa de carregar os termos; "Tentar de novo" cria uma nova.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([glossaryRepository.listTerms(), glossaryRepository.getProgress()]).then(
      ([loadedTerms, loadedProgress]) => {
        if (!active) return;
        setTerms(loadedTerms);
        setProgress(loadedProgress);
        setStatus("ready");
      },
      (reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus("error");
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((current) => current + 1);
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

  return { terms, progress, updateProgress, status, error, retry };
}
