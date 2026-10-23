"use client";

import { useEffect, useRef, useState } from "react";
import { pad } from "@/lib/glossary/filters";
import type { Term, TermProgress } from "@/lib/glossary/types";

interface TermCardProps {
  term: Term;
  total: number;
  progress: TermProgress;
  /** Espaço no pé do cartão que fica escondido dentro da pasta. */
  tuckedHeight: number;
  onReveal: () => void;
  onMark: (review: boolean) => void;
  onClose: () => void;
}

const actionClass =
  "label border border-card-text px-3 py-2.5 hover:bg-card-text hover:text-card focus-visible:outline-card-text";

export function TermCard({ term, total, progress, tuckedHeight, onReveal, onMark, onClose }: TermCardProps) {
  const [revealed, setRevealed] = useState(false);
  const revealRef = useRef<HTMLButtonElement>(null);
  const definitionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    revealRef.current?.focus({ preventScroll: true });
  }, []);

  function reveal() {
    setRevealed(true);
    onReveal();
    requestAnimationFrame(() => definitionRef.current?.focus({ preventScroll: true }));
  }

  const titleId = `termo-${term.id}-titulo`;

  return (
    <article
      aria-labelledby={titleId}
      className="bg-card text-card-text"
      style={{ paddingBottom: tuckedHeight + 20 }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-4">
        <p className="label flex flex-wrap gap-x-2 gap-y-1.5 opacity-80">
          <span className="whitespace-nowrap">
            REC {pad(term.number, 3)} / {pad(total, 3)}
          </span>
          <span>· {term.category}</span>
        </p>
        <button type="button" onClick={onClose} className="label -m-2 p-2 hover:underline focus-visible:outline-card-text">
          Fechar
        </button>
      </div>

      <div className="px-5 pt-5">
        <h2 id={titleId} className="text-[16px] font-medium tracking-[0.04em] uppercase">
          {term.name}
        </h2>

        {revealed ? (
          <>
            <p ref={definitionRef} tabIndex={-1} className="mt-3 text-[15px] leading-relaxed focus:outline-none">
              {term.definition}
            </p>
            <p className="label mt-6 opacity-80">Você lembrou?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={actionClass} onClick={() => onMark(false)}>
                Lembrei
              </button>
              <button type="button" className={actionClass} onClick={() => onMark(true)}>
                Revisar depois
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-relaxed">
              Tente lembrar o significado antes de abrir a definição.
            </p>
            {progress.review ? <p className="label mt-3 opacity-80">Marcado para revisar</p> : null}
            <div className="mt-6">
              <button ref={revealRef} type="button" className={actionClass} onClick={reveal}>
                Revelar definição
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
