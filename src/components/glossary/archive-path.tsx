import type { Term } from "@/lib/glossary/types";

interface ArchivePathProps {
  rangeLabel: string | null;
  openTerm: Term | null;
  onGoToLetters: () => void;
  onGoToRange: () => void;
}

/** Caminho do arquivo: ARQUIVO / A–C / AFFORDANCE. Cada nível anterior volta para ele. */
export function ArchivePath({ rangeLabel, openTerm, onGoToLetters, onGoToRange }: ArchivePathProps) {
  const linkClass = "label cursor-pointer text-tinta-suave underline-offset-4 hover:text-tinta hover:underline";

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
          <span aria-hidden className="text-tinta-suave">
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
          <span aria-hidden className="text-tinta-suave">
            /
          </span>
          <span aria-current="page" className="truncate">
            {openTerm.name}
          </span>
        </>
      ) : null}
    </nav>
  );
}
