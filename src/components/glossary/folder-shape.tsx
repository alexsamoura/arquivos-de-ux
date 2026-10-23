/** Altura da aba, acima da linha superior do corpo da pasta. */
export const TAB_H = 22;
/** Quanto cada pasta desce em relação à de trás. */
export const STEP = 28;
/** Avanço horizontal da inclinação lateral da aba. */
const SLANT = 10;
/** Largura de um caractere do rótulo: 0.6em (mono) + 0.08em de letter-spacing, a 12px. */
const CHAR_W = 12 * 0.68;

export interface TabGeometry {
  x: number;
  width: number;
}

export function tabWidthFor(label: string, maxWidth: number) {
  return Math.min(Math.round(label.length * CHAR_W + 2 * SLANT + 20), Math.floor(maxWidth));
}

/** Área útil para o texto dentro da aba, descontando as laterais inclinadas. */
export function tabTextBox(tab: TabGeometry) {
  return { left: tab.x + SLANT + 2, width: tab.width - 2 * SLANT - 4 };
}

/**
 * Contorno único da pasta: corpo + aba trapezoidal num só path, para que a linha
 * de 1px siga sem emendas pelas laterais inclinadas. As coordenadas usam meio
 * pixel para o traço cair exatamente na grade.
 */
function folderPath(width: number, height: number, tab: TabGeometry | null) {
  const left = 0.5;
  const right = width - 0.5;
  const top = TAB_H + 0.5;
  const bottom = height - 0.5;
  const r = 3;

  const tabEdge = tab
    ? `H${tab.x} L${tab.x + SLANT} 0.5 H${tab.x + tab.width - SLANT} L${tab.x + tab.width} ${top} `
    : "";

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
  /** Aba preenchida de tinta (divisórias alfabéticas). */
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
        fill="var(--folder)"
        stroke="var(--ink)"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {filledTab && tab ? (
        <path d={tabPath(tab)} fill="var(--ink)" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" />
      ) : null}
    </svg>
  );
}
