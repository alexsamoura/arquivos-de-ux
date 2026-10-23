"use client";

import type { CSSProperties, ReactNode } from "react";
import { pad } from "@/lib/glossary/filters";
import {
  EMPTY_PROGRESS,
  RANGES,
  type ProgressMap,
  type RangeId,
  type Term,
  type TermProgress,
} from "@/lib/glossary/types";
import { FolderShape, STEP, TAB_H, tabTextBox, tabWidthFor, type TabGeometry } from "./folder-shape";
import { TermCard } from "./term-card";
import { useElementWidth } from "./use-element-width";

/** Altura de layout de uma pasta fechada: aba + faixa visível + folga escondida. */
const SHEET_H = TAB_H + STEP + 8;
/**
 * Altura desenhada do corpo. É maior que a de layout para que a pasta continue
 * visível atrás das da frente; a pasta seguinte, mais larga, a cobre.
 */
const SHEET_BODY_H = 1600;
const FRONT_H = TAB_H + 128;
/** Quanto do cartão aberto fica guardado dentro da pasta. */
const TUCK = TAB_H + 14;
/** No nível das letras há só quatro pastas, então cada uma desce mais e mostra mais corpo. */
const LETTER_STEP = 56;
const MAX_WIDTH_STEP = 12;
const TERM_TAB_POSITIONS = ["left", "center", "right"] as const;
const RANGE_TAB_FRACTIONS = [0.05, 0.29, 0.53, 0.77];
/** Intervalo entre a entrada de uma pasta e a próxima ao trocar de nível. */
const ENTER_STAGGER_MS = 30;

type Range = (typeof RANGES)[number];

interface FolderStackProps {
  /** Faixa aberta; `null` mostra o arquivo só com as pastas das letras. */
  activeRange: RangeId | null;
  rangeCounts: Record<RangeId, number>;
  onSelectRange: (range: RangeId | null) => void;
  terms: Term[];
  total: number;
  /** Termos que batem com os filtros, somando todas as faixas. */
  matchCount: number;
  filtering: boolean;
  progress: ProgressMap;
  openId: string | null;
  onOpen: (termId: string | null) => void;
  onUpdateProgress: (termId: string, patch: Partial<TermProgress>) => void;
  /** Pastas que bateram com a busca mas passaram do limite da pilha. */
  overflow: number;
}

type Layer =
  | { kind: "range"; range: Range; index: number }
  | { kind: "term"; term: Term; index: number }
  | { kind: "front" };

export function FolderStack(props: FolderStackProps) {
  const { activeRange, terms, openId } = props;
  const [ref, containerWidth] = useElementWidth<HTMLDivElement>();

  const range = RANGES.find((r) => r.id === activeRange) ?? null;
  const layers: Layer[] = range
    ? [
        { kind: "range", range, index: RANGES.indexOf(range) },
        ...terms.map((term, index) => ({ kind: "term" as const, term, index })),
        { kind: "front" },
      ]
    : [...RANGES.map((r, index) => ({ kind: "range" as const, range: r, index })), { kind: "front" }];

  // Falsa perspectiva: cada camada à frente é um pouco mais larga. Em telas
  // estreitas o passo diminui para a pasta do fundo não ficar apertada demais.
  const widthStep =
    layers.length > 1 ? Math.min(MAX_WIDTH_STEP, Math.floor((containerWidth * 0.26) / (layers.length - 1))) : 0;
  const widthOf = (index: number) => containerWidth - (layers.length - 1 - index) * widthStep;

  // Com um termo aberto, a pasta dele vai para o topo: as de trás saem da pilha
  // e o cartão sobe de dentro dela. As larguras continuam as da pilha completa.
  const openIndex = openId ? layers.findIndex((l) => l.kind === "term" && l.term.id === openId) : -1;
  const firstVisible = Math.max(openIndex, 0);
  const step = range ? STEP : LETTER_STEP;

  const closeCard = (termId: string) => {
    props.onOpen(null);
    requestAnimationFrame(() => document.getElementById(folderButtonId(termId))?.focus({ preventScroll: true }));
  };

  return (
    // overflow: clip (e não hidden) corta os corpos altos das pastas sem criar uma
    // área rolável, que o foco ou o scrollIntoView poderiam deslocar.
    <div ref={ref} className="overflow-clip pt-1">
      {containerWidth > 0 &&
        layers.slice(firstVisible).map((layer, visibleIndex) => {
          const layerIndex = firstVisible + visibleIndex;
          const width = widthOf(layerIndex);
          const style: CSSProperties = {
            width,
            zIndex: layerIndex + 1,
            marginTop: visibleIndex === 0 ? 0 : step - SHEET_H,
            animationDelay: `${layerIndex * ENTER_STAGGER_MS}ms`,
          };

          if (layer.kind === "range") {
            return (
              <RangeSheet
                key={`range-${layer.range.id}`}
                style={style}
                width={width}
                layer={layer}
                step={step}
                count={props.rangeCounts[layer.range.id]}
                isOpen={range !== null}
                onSelect={() => props.onSelectRange(range ? null : layer.range.id)}
              />
            );
          }

          if (layer.kind === "term") {
            const { term } = layer;
            const termProgress = props.progress[term.id] ?? EMPTY_PROGRESS;
            const isOpen = openId === term.id;
            const label = `${pad(term.number, 3)} ${term.name}${termProgress.review ? " [R]" : ""}`;
            const tabW = tabWidthFor(label, width * 0.72);
            const position = TERM_TAB_POSITIONS[layer.index % TERM_TAB_POSITIONS.length];
            const tab = placeTab(width, tabW, position === "left" ? 18 : position === "center" ? (width - tabW) / 2 : width);

            return (
              <Sheet
                key={term.id}
                style={style}
                width={width}
                tab={tab}
                drawer={
                  isOpen ? (
                    <div style={{ marginBottom: -TUCK }}>
                      <div className="card-rise mx-auto" style={{ width: width - 32 }}>
                        <TermCard
                          key={term.id}
                          term={term}
                          total={props.total}
                          progress={termProgress}
                          tuckedHeight={TUCK}
                          onReveal={() => props.onUpdateProgress(term.id, { seen: true })}
                          onMark={(review) => {
                            props.onUpdateProgress(term.id, { seen: true, review });
                            closeCard(term.id);
                          }}
                          onClose={() => closeCard(term.id)}
                        />
                      </div>
                    </div>
                  ) : null
                }
              >
                <TabLabel tab={tab} className={isOpen ? "underline underline-offset-4" : "group-hover:underline group-hover:underline-offset-4"}>
                  {label}
                </TabLabel>
                {/* Área clicável = aba + faixa visível do corpo, sem invadir a pasta de trás. */}
                <button
                  id={folderButtonId(term.id)}
                  type="button"
                  onClick={() => (isOpen ? closeCard(term.id) : props.onOpen(term.id))}
                  aria-expanded={isOpen}
                  aria-label={`${pad(term.number, 3)} ${term.name}${termProgress.review ? ", marcado para revisar" : ""}${termProgress.seen ? ", já visto" : ""}`}
                  className="absolute left-0 cursor-pointer"
                  style={{ top: TAB_H, width, height: STEP }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => (isOpen ? closeCard(term.id) : props.onOpen(term.id))}
                  className="absolute top-0 cursor-pointer"
                  style={{ left: tab.x, width: tab.width, height: TAB_H }}
                />
              </Sheet>
            );
          }

          return (
            <Sheet key={`front-${activeRange ?? "arquivo"}`} style={style} width={width} tab={null} height={FRONT_H} bodyHeight={FRONT_H}>
              <div
                className="absolute inset-x-0 flex flex-col items-center justify-center gap-3 px-4 text-center"
                style={{ top: TAB_H, bottom: 0 }}
                aria-live="polite"
              >
                <FrontLabel {...props} rangeLabel={range?.label ?? null} />
              </div>
            </Sheet>
          );
        })}
    </div>
  );
}

function FrontLabel({
  rangeLabel,
  terms,
  total,
  matchCount,
  filtering,
  overflow,
  onSelectRange,
}: FolderStackProps & { rangeLabel: string | null }) {
  if (matchCount === 0) return <p className="label">Nenhum arquivo encontrado</p>;

  if (rangeLabel === null) {
    return (
      <>
        <p className="label">
          Arquivo / {pad(filtering ? matchCount : total)} {filtering ? "encontrados" : "termos"}
        </p>
        <p className="label text-ink-muted">Escolha uma letra</p>
      </>
    );
  }

  return (
    <>
      <p className="label">
        {rangeLabel} / {pad(terms.length)} {terms.length === 1 ? "arquivo" : "arquivos"}
      </p>
      <p className="label text-ink-muted">
        {overflow > 0 ? `+${pad(overflow)} fora da pilha · refine a busca` : "Escolha um termo e tente lembrar"}
      </p>
      <button type="button" className="label mt-2 py-1.5 underline-offset-4 hover:underline" onClick={() => onSelectRange(null)}>
        Voltar às letras
      </button>
    </>
  );
}

interface RangeSheetProps {
  style: CSSProperties;
  width: number;
  layer: Extract<Layer, { kind: "range" }>;
  /** Faixa visível do corpo, entre esta pasta e a da frente. */
  step: number;
  count: number;
  /** A faixa está aberta e esta pasta serve de cabeçalho da pilha de termos. */
  isOpen: boolean;
  onSelect: () => void;
}

function RangeSheet({ style, width, layer, step, count, isOpen, onSelect }: RangeSheetProps) {
  const tabW = tabWidthFor("A–C", width * 0.4);
  const tab = placeTab(width, tabW, RANGE_TAB_FRACTIONS[layer.index] * width);
  const empty = count === 0 && !isOpen;
  const hint = isOpen ? "Voltar às letras" : `${pad(count)} ${count === 1 ? "arquivo" : "arquivos"}`;

  return (
    <Sheet style={style} width={width} tab={tab} filledTab>
      <TabLabel tab={tab} className="text-folder">
        {layer.range.label}
      </TabLabel>
      {isOpen ? (
        // Pasta da letra aberta, no topo da pilha de termos: dica de volta à direita.
        <span
          aria-hidden
          className="label pointer-events-none absolute right-5 text-ink-muted group-hover:text-ink"
          style={{ top: TAB_H, lineHeight: `${step}px` }}
        >
          {hint}
        </span>
      ) : (
        // Contagem logo abaixo da aba, acima de onde a aba da pasta seguinte encosta.
        <span
          aria-hidden
          className={`label pointer-events-none absolute group-hover:underline group-hover:underline-offset-4 ${empty ? "text-ink-muted" : ""}`}
          style={{ top: TAB_H + 11, left: tab.x + 10 }}
        >
          {hint}
        </span>
      )}
      <button
        type="button"
        onClick={onSelect}
        disabled={empty}
        aria-label={isOpen ? `Fechar faixa ${layer.range.label} e voltar às letras` : `Abrir faixa ${layer.range.label}, ${count} arquivos`}
        className="absolute left-0 cursor-pointer disabled:cursor-not-allowed"
        style={{ top: TAB_H, width, height: step }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onSelect}
        disabled={empty}
        className="absolute top-0 cursor-pointer disabled:cursor-not-allowed"
        style={{ left: tab.x, width: tab.width, height: TAB_H }}
      />
    </Sheet>
  );
}

function folderButtonId(termId: string) {
  return `pasta-${termId}`;
}

/** Mantém a aba dentro da pasta, com respiro mínimo nas bordas. */
function placeTab(width: number, tabWidth: number, x: number): TabGeometry {
  const margin = 18;
  return { x: Math.round(Math.max(margin, Math.min(x, width - tabWidth - margin))), width: tabWidth };
}

interface SheetProps {
  style: CSSProperties;
  width: number;
  tab: TabGeometry | null;
  filledTab?: boolean;
  height?: number;
  bodyHeight?: number;
  drawer?: ReactNode;
  children: ReactNode;
}

function Sheet({ style, width, tab, filledTab, height = SHEET_H, bodyHeight = SHEET_BODY_H, drawer, children }: SheetProps) {
  return (
    <div className="sheet-enter relative mx-auto" style={style}>
      {drawer}
      <div className="group relative" style={{ height }}>
        <FolderShape width={width} height={bodyHeight} tab={tab} filledTab={filledTab} />
        {children}
      </div>
    </div>
  );
}

function TabLabel({ tab, className = "", children }: { tab: TabGeometry; className?: string; children: ReactNode }) {
  const box = tabTextBox(tab);
  return (
    <span
      aria-hidden
      className={`label pointer-events-none absolute top-0 truncate text-center ${className}`}
      style={{ left: box.left, width: box.width, height: TAB_H, lineHeight: `${TAB_H + 1}px` }}
    >
      {children}
    </span>
  );
}
