"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Drawer, DrawerId } from "@/lib/glossary/types";
import { HALF_STROKE, STROKE } from "./folder-shape";
import { focusForKeyboard } from "./input-modality";

export const DRAWER_H = 76;

/** Quantidade de termos por extenso. Só vai no aria-label: a frente da gaveta mostra apenas a etiqueta. */
export function termCount(count: number) {
  return `${count} ${count === 1 ? "termo" : "termos"}`;
}

interface DrawerFaceProps {
  label: string;
  /** Texto pequeno abaixo do puxador, na gaveta aberta. */
  footer?: ReactNode;
  muted?: boolean;
  height?: number;
  /**
   * Largura da frente da gaveta aberta: peça separada, com a borda de cima em duas
   * linhas paralelas (a espessura da tábua). Sem ela, a frente é a do gaveteiro.
   */
  panelWidth?: number;
}

/** Distância entre as duas linhas da borda de cima da frente aberta. */
const PANEL_RIM = 5;

/** Frente de gaveta: porta-etiqueta só com a letra ou faixa, e o puxador abaixo. */
export function DrawerFace({ label, footer, muted = false, height = DRAWER_H, panelWidth }: DrawerFaceProps) {
  return (
    <div
      className={`superficie relative flex flex-col items-center justify-center gap-2.5 ${panelWidth ? "pt-1" : "border-2 border-tinta bg-papel"}`}
      style={{ height: panelWidth ? height : undefined, minHeight: panelWidth ? undefined : height }}
    >
      {panelWidth ? (
        <svg
          aria-hidden
          width={panelWidth}
          height={height}
          viewBox={`0 0 ${panelWidth} ${height}`}
          className="pointer-events-none absolute inset-0 block"
        >
          <path
            d={`M${HALF_STROKE} ${HALF_STROKE} H${panelWidth - HALF_STROKE} V${height - HALF_STROKE} H${HALF_STROKE} Z M${HALF_STROKE} ${PANEL_RIM + HALF_STROKE} H${panelWidth - HALF_STROKE}`}
            fill="var(--papel)"
            stroke="var(--tinta)"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <span
        className={`relative flex min-w-32 flex-col items-center gap-1.5 border-2 border-tinta bg-papel px-4 py-2 ${muted ? "text-tinta-suave" : ""}`}
      >
        <span className="tab-label text-[15px] font-medium">{label}</span>
      </span>
      <span aria-hidden className="relative block h-2 w-16 rounded-full border-2 border-tinta" />
      {footer ? <span className="relative">{footer}</span> : null}
    </div>
  );
}

interface DrawerCabinetProps {
  drawers: Drawer[];
  rangeCounts: Record<DrawerId, number>;
  /** Gaveta que acabou de ser fechada: recebe o foco ao voltar para a capa. */
  focusRange?: DrawerId | null;
  /** `originTop` é a posição da gaveta na tela, ponto de partida da animação. */
  onOpen: (range: DrawerId, originTop: number) => void;
  hasResults: boolean;
}

/** A capa já apareceu nesta visita: só a volta de uma gaveta anima as gavetas. */
let coverShown = false;

/** Capa do arquivo: gaveteiro com uma gaveta por faixa de letras. */
export function DrawerCabinet({ drawers, rangeCounts, focusRange, onOpen, hasResults }: DrawerCabinetProps) {
  const listRef = useRef<HTMLDivElement>(null);
  // Lido na montagem: no primeiro carregamento as gavetas aparecem já prontas.
  const [animateEnter] = useState(() => coverShown);

  useEffect(() => {
    coverShown = true;
  }, []);

  useEffect(() => {
    if (!focusRange) return;
    focusForKeyboard(listRef.current?.querySelector<HTMLButtonElement>(`[data-range="${focusRange}"]`));
  }, [focusRange]);

  return (
    <div className="flex flex-col gap-4">
      {/* Uma coluna no celular; duas no desktop, para o gaveteiro não ficar alto demais. */}
      <div
        ref={listRef}
        role="list"
        aria-label="Gavetas do arquivo"
        // Ordem alfabética de cima para baixo: a 1ª coluna inteira, depois a 2ª.
        className="grid grid-cols-1 gap-2 border-2 border-tinta p-2.5 sm:grid-flow-col sm:grid-cols-2"
        style={{ gridTemplateRows: `repeat(${Math.ceil(drawers.length / 2)}, auto)` }}
      >
        {drawers.map((range) => {
          const count = rangeCounts[range.id];
          const empty = count === 0;
          return (
            <div role="listitem" key={range.id} className={animateEnter ? "sheet-enter" : undefined}>
              <button
                type="button"
                data-range={range.id}
                disabled={empty}
                aria-label={`Abrir gaveta ${range.label}, ${termCount(count)}`}
                onClick={(event) => onOpen(range.id, event.currentTarget.getBoundingClientRect().top)}
                className="group block w-full cursor-pointer text-left disabled:cursor-not-allowed motion-safe:transition-transform motion-safe:duration-150 enabled:hover:translate-y-0.5"
              >
                <DrawerFace label={range.label} muted={empty} />
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
