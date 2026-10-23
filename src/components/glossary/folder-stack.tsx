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
 * visível atrás de um cartão aberto; a pasta da frente, mais larga, a cobre.
 */
const SHEET_BODY_H = 1600;
const FRONT_H = TAB_H + 128;
/** Quanto do cartão aberto fica guardado dentro da pasta. */
const TUCK = TAB_H + 14;
const MAX_WIDTH_STEP = 12;
const TERM_TAB_POSITIONS = ["left", "center", "right"] as const;
const RANGE_TAB_FRACTIONS = [0.05, 0.29, 0.53, 0.77];

interface FolderStackProps {
  terms: Term[];
  total: number;
  progress: ProgressMap;
  rangeCounts: Record<RangeId, number>;
  activeRange: RangeId;
  onSelectRange: (range: RangeId) => void;
  openId: string | null;
  onToggle: (termId: string) => void;
  onUpdateProgress: (termId: string, patch: Partial<TermProgress>) => void;
  hasResults: boolean;
  /** Pastas que bateram com a busca mas passaram do limite da pilha. */
  overflow: number;
}

type Layer =
  | { kind: "range"; range: (typeof RANGES)[number]; index: number }
  | { kind: "term"; term: Term; index: number }
  | { kind: "front" };

export function FolderStack(props: FolderStackProps) {
  const { terms, rangeCounts, activeRange, hasResults } = props;
  const [ref, containerWidth] = useElementWidth<HTMLDivElement>();

  const layers: Layer[] = [
    ...RANGES.map((range, index) => ({ kind: "range" as const, range, index })),
    ...terms.map((term, index) => ({ kind: "term" as const, term, index })),
    { kind: "front" },
  ];

  // Falsa perspectiva: cada camada à frente é um pouco mais larga. Em telas
  // estreitas o passo diminui para a pasta do fundo não ficar apertada demais.
  const widthStep =
    layers.length > 1 ? Math.min(MAX_WIDTH_STEP, Math.floor((containerWidth * 0.26) / (layers.length - 1))) : 0;
  const widthOf = (index: number) => containerWidth - (layers.length - 1 - index) * widthStep;

  const activeLabel = RANGES.find((r) => r.id === activeRange)?.label ?? "";

  return (
    // overflow: clip (e não hidden) corta os corpos altos das pastas sem criar uma
    // área rolável, que o foco ou o scrollIntoView poderiam deslocar.
    <div ref={ref} className="overflow-clip pt-1">
      {containerWidth > 0 &&
        layers.map((layer, layerIndex) => {
          const width = widthOf(layerIndex);
          const style: CSSProperties = {
            width,
            zIndex: layerIndex + 1,
            marginTop: layerIndex === 0 ? 0 : STEP - SHEET_H,
          };

          if (layer.kind === "range") {
            const label = layer.range.id === activeRange ? `[${layer.range.label}]` : layer.range.label;
            const tabW = tabWidthFor("[A–C]", width * 0.4);
            const tab = placeTab(width, tabW, RANGE_TAB_FRACTIONS[layer.index] * width);
            const empty = rangeCounts[layer.range.id] === 0;
            return (
              <Sheet key={layer.range.id} style={style} width={width} tab={tab} filledTab>
                <TabLabel tab={tab} className="text-folder">
                  {label}
                </TabLabel>
                <button
                  type="button"
                  onClick={() => props.onSelectRange(layer.range.id)}
                  disabled={empty}
                  aria-pressed={layer.range.id === activeRange}
                  aria-label={`Faixa ${layer.range.label}, ${rangeCounts[layer.range.id]} arquivos`}
                  className="absolute top-0 cursor-pointer disabled:cursor-not-allowed"
                  style={{ left: tab.x, width: tab.width, height: TAB_H }}
                />
              </Sheet>
            );
          }

          if (layer.kind === "term") {
            const { term } = layer;
            const termProgress = props.progress[term.id] ?? EMPTY_PROGRESS;
            const isOpen = props.openId === term.id;
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
                    <div className="drawer" style={{ paddingTop: TAB_H + 10, marginBottom: -TUCK }}>
                      <div className="min-h-0 overflow-hidden">
                        <div className="mx-auto" style={{ width: width - 32 }}>
                          <TermCard
                            key={term.id}
                            term={term}
                            total={props.total}
                            progress={termProgress}
                            tuckedHeight={TUCK}
                            onReveal={() => props.onUpdateProgress(term.id, { seen: true })}
                            onMark={(review) => {
                              props.onUpdateProgress(term.id, { seen: true, review });
                              props.onToggle(term.id);
                            }}
                            onClose={() => {
                              props.onToggle(term.id);
                              document.getElementById(folderButtonId(term.id))?.focus({ preventScroll: true });
                            }}
                          />
                        </div>
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
                  onClick={() => props.onToggle(term.id)}
                  aria-expanded={isOpen}
                  aria-label={`${pad(term.number, 3)} ${term.name}${termProgress.review ? ", marcado para revisar" : ""}${termProgress.seen ? ", já visto" : ""}`}
                  className="absolute left-0 cursor-pointer"
                  style={{ top: TAB_H, width, height: STEP }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => props.onToggle(term.id)}
                  className="absolute top-0 cursor-pointer"
                  style={{ left: tab.x, width: tab.width, height: TAB_H }}
                />
              </Sheet>
            );
          }

          return (
            <Sheet key="front" style={style} width={width} tab={null} height={FRONT_H} bodyHeight={FRONT_H}>
              <div
                className="absolute inset-x-0 flex flex-col items-center justify-center gap-3 px-4 text-center"
                style={{ top: TAB_H, bottom: 0 }}
                aria-live="polite"
              >
                {hasResults ? (
                  <>
                    <p className="label">
                      {activeLabel} / {pad(terms.length)} {terms.length === 1 ? "arquivo" : "arquivos"}
                    </p>
                    <p className="label text-ink-muted">
                      {props.overflow > 0
                        ? `+${pad(props.overflow)} fora da pilha · refine a busca`
                        : "Abra uma pasta e tente lembrar"}
                    </p>
                  </>
                ) : (
                  <p className="label">Nenhum arquivo encontrado</p>
                )}
              </div>
            </Sheet>
          );
        })}
    </div>
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
    <div className="relative mx-auto" style={style}>
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
