"use client";

import { forwardRef, type ReactNode } from "react";
import { pad } from "@/lib/glossary/filters";
import { RANGES, type RangeId } from "@/lib/glossary/types";

export const DRAWER_H = 84;

function termCount(count: number) {
  return `${pad(count)} ${count === 1 ? "termo" : "termos"}`;
}

interface DrawerFaceProps {
  label: string;
  count: number;
  /** Texto pequeno abaixo do puxador, na gaveta aberta. */
  footer?: ReactNode;
  muted?: boolean;
  height?: number;
}

/** Frente de gaveta: porta-etiqueta com a faixa e a contagem, e o puxador abaixo. */
export const DrawerFace = forwardRef<HTMLDivElement, DrawerFaceProps>(function DrawerFace(
  { label, count, footer, muted = false, height = DRAWER_H },
  ref,
) {
  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-2.5 border border-tinta bg-papel"
      style={{ minHeight: height }}
    >
      <span
        className={`flex min-w-32 flex-col items-center gap-1.5 border border-tinta px-4 py-2 ${muted ? "text-tinta-suave" : ""}`}
      >
        <span className="tab-label text-[15px] font-medium">{label}</span>
        <span className="label text-tinta-suave">{termCount(count)}</span>
      </span>
      <span aria-hidden className="block h-2 w-16 rounded-full border border-tinta" />
      {footer}
    </div>
  );
});

interface DrawerCabinetProps {
  rangeCounts: Record<RangeId, number>;
  /** `originTop` é a posição da gaveta na tela, ponto de partida da animação. */
  onOpen: (range: RangeId, originTop: number) => void;
  hasResults: boolean;
}

/** Capa do arquivo: gaveteiro com uma gaveta por faixa de letras. */
export function DrawerCabinet({ rangeCounts, onOpen, hasResults }: DrawerCabinetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div role="list" aria-label="Gavetas do arquivo" className="flex flex-col gap-2 border border-tinta p-2.5">
        {RANGES.map((range) => {
          const count = rangeCounts[range.id];
          const empty = count === 0;
          return (
            <div role="listitem" key={range.id} className="sheet-enter">
              <button
                type="button"
                disabled={empty}
                aria-label={`Abrir gaveta ${range.label}, ${count} ${count === 1 ? "termo" : "termos"}`}
                onClick={(event) => onOpen(range.id, event.currentTarget.getBoundingClientRect().top)}
                className="group block w-full cursor-pointer text-left disabled:cursor-not-allowed motion-safe:transition-transform motion-safe:duration-150 enabled:hover:translate-y-0.5"
              >
                <DrawerFace label={range.label} count={count} muted={empty} />
              </button>
            </div>
          );
        })}
      </div>
      {hasResults ? null : (
        <p className="label text-center" aria-live="polite">
          Nenhum arquivo encontrado
        </p>
      )}
    </div>
  );
}
