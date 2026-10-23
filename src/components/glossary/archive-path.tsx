import { pad } from "@/lib/glossary/filters";
import type { Term } from "@/lib/glossary/types";

interface ArchivePathProps {
  rangeLabel: string | null;
  openTerm: Term | null;
  onGoToLetters: () => void;
  onGoToRange: () => void;
}

/** Caminho do arquivo: ARQUIVO / A–C / 003 AFFORDANCE. Cada nível anterior volta para ele. */
export function ArchivePath({ rangeLabel, openTerm, onGoToLetters, onGoToRange }: ArchivePathProps) {
  const linkClass = "label cursor-pointer text-ink-muted underline-offset-4 hover:text-ink hover:underline";

  return (
    <nav aria-label="Caminho no arquivo" className="label flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
      {rangeLabel ? (
        <button type="button" className={linkClass} onClick={onGoToLetters}>
          Arquivo
        </button>
      ) : (
        <span aria-current="page">Arquivo</span>
      )}
      {rangeLabel ? (
        <>
          <span aria-hidden className="text-ink-muted">
            /
          </span>
          {openTerm ? (
            <button type="button" className={linkClass} onClick={onGoToRange}>
              {rangeLabel}
            </button>
          ) : (
            <span aria-current="page">{rangeLabel}</span>
          )}
        </>
      ) : null}
      {openTerm ? (
        <>
          <span aria-hidden className="text-ink-muted">
            /
          </span>
          <span aria-current="page" className="truncate">
            {pad(openTerm.number, 3)} {openTerm.name}
          </span>
        </>
      ) : null}
    </nav>
  );
}
