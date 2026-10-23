import type { ReactNode } from "react";

/** Altura da aba, acima da linha superior do corpo da pasta. */
export const TAB_H = 24;
/** Quanto cada pasta desce em relação à de trás. */
export const STEP = 30;
/** Avanço horizontal da inclinação lateral da aba. */
const SLANT = 10;
/** Respiro interno da aba, somando os dois lados, entre as laterais inclinadas e o texto. */
const TAB_PADDING = 8;
/** Largura de um caractere da aba: 0.6em (mono) + 0.08em de letter-spacing, a 13px. */
const CHAR_W = 13 * 0.68;
/** Tique de "visto" + espaço antes do nome. */
const SEEN_MARK_W = 10 + 6;
/** Carimbo "REVISAR" (12px, 0.12em de letter-spacing) + espaço antes dele. */
const STAMP_W = Math.ceil(7 * 12 * 0.72) + 8;

export interface TabGeometry {
  x: number;
  width: number;
}

export interface TabMarks {
  seen?: boolean;
  review?: boolean;
}

/**
 * A aba cresce para caber o nome e as marcas. Com o carimbo de revisar o tique
 * sai: marcar para revisar só é possível depois de ver o termo.
 */
export function tabWidthFor(label: string, maxWidth: number, marks: TabMarks = {}) {
  const extra = marks.review ? STAMP_W : marks.seen ? SEEN_MARK_W : 0;
  return Math.min(Math.ceil(label.length * CHAR_W + 2 * SLANT + TAB_PADDING + extra), Math.floor(maxWidth));
}

/** Área útil para o texto dentro da aba, descontando as laterais inclinadas. */
export function tabTextBox(tab: TabGeometry) {
  return { left: tab.x + SLANT, width: tab.width - 2 * SLANT };
}

/** Carimbo vermelho de "revisar", sem moldura. */
export function ReviewStamp({ className = "" }: { className?: string }) {
  return <span className={`stamp shrink-0 ${className}`}>Revisar</span>;
}

/** Tique de traço fino para termos já vistos, no mesmo peso do contorno das pastas. */
function SeenMark() {
  return (
    <svg aria-hidden width="10" height="8" viewBox="0 0 10 8" className="shrink-0 text-tinta-suave">
      <path d="M1 4.2 L3.8 7 L9 1" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Rótulo da aba: texto centralizado entre as laterais inclinadas. Termos vistos
 * ganham o tique e o nome em tinta suave; os marcados para revisar, o carimbo
 * depois do nome, dentro da aba.
 */
export function TabLabel({
  tab,
  seen = false,
  review = false,
  className = "",
  children,
}: TabMarks & {
  tab: TabGeometry;
  className?: string;
  children: ReactNode;
}) {
  const box = tabTextBox(tab);
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-0 flex items-center justify-center gap-1.5 overflow-hidden"
      style={{ left: box.left, width: box.width, height: TAB_H }}
    >
      {seen && !review ? <SeenMark /> : null}
      <span className={`tab-label min-w-0 truncate pt-px ${seen ? "text-tinta-suave" : ""} ${className}`}>
        {children}
      </span>
      {review ? <ReviewStamp className="ml-0.5" /> : null}
    </span>
  );
}

/**
 * Contorno único da pasta: corpo + aba trapezoidal num só path, para que a linha
 * de 1px siga sem emendas pelas laterais inclinadas. As coordenadas usam meio
 * pixel para o traço cair exatamente na grade.
 * Forma fechada: topo com aba, laterais curtas, cantos de cima arredondados e base.
 */
function folderPath(width: number, height: number, tab: TabGeometry | null) {
  const left = 0.5;
  const right = width - 0.5;
  const top = TAB_H + 0.5;
  const bottom = height - 0.5;
  const tabEdge = tab
    ? `H${tab.x} L${tab.x + SLANT} 0.5 H${tab.x + tab.width - SLANT} L${tab.x + tab.width} ${top} `
    : "";
  const r = 3;
  return (
    `M${left} ${bottom} V${top + r} Q${left} ${top} ${left + r} ${top} ` +
    tabEdge +
    `H${right - r} Q${right} ${top} ${right} ${top + r} V${bottom} Z`
  );
}

function tabPath(tab: TabGeometry) {
  const top = TAB_H + 0.5;
  return `M${tab.x} ${top} L${tab.x + SLANT} 0.5 H${tab.x + tab.width - SLANT} L${tab.x + tab.width} ${top} Z`;
}

interface FolderShapeProps {
  width: number;
  height: number;
  tab: TabGeometry | null;
  /** Aba preenchida de tinta: divisórias por letra. */
  filledTab?: boolean;
}

export function FolderShape({ width, height, tab, filledTab = false }: FolderShapeProps) {
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute top-0 left-0 block"
    >
      <path
        d={folderPath(width, height, tab)}
        fill="var(--papel)"
        stroke="var(--tinta)"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {filledTab && tab ? (
        <path d={tabPath(tab)} fill="var(--tinta)" stroke="var(--tinta)" strokeWidth={1} strokeLinejoin="round" />
      ) : null}
    </svg>
  );
}
