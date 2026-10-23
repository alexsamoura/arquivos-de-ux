"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { pad } from "@/lib/glossary/filters";
import { EMPTY_PROGRESS, RANGES, type ProgressMap, type RangeId, type Term, type TermProgress } from "@/lib/glossary/types";
import { DrawerCabinet, DrawerFace } from "./drawer-cabinet";
import { FolderShape, STEP, TAB_H, TabLabel, tabWidthFor, type TabGeometry } from "./folder-shape";
import { LiftedFolder, prefersReducedMotion } from "./lifted-folder";
import { useElementSize } from "./use-element-size";

/** Altura de layout de uma pasta fechada: aba + faixa visível + folga escondida. */
const SHEET_H = TAB_H + STEP + 8;
/**
 * Altura desenhada do corpo. É maior que a de layout para que a pasta continue
 * visível atrás das da frente; a pasta seguinte, mais larga, a cobre.
 */
const SHEET_BODY_H = 1600;
const MAX_WIDTH_STEP = 12;
/** Fração máxima da largura da pasta que uma aba pode ocupar. */
const MAX_TAB_FRACTION = 0.86;
const TERM_TAB_POSITIONS = ["left", "center", "right"] as const;
/** Intervalo entre a entrada de uma pasta e a próxima ao abrir a gaveta. */
const ENTER_STAGGER_MS = 30;
const DRAWER_SLIDE_MS = 460;

interface FolderStackProps {
  /** Gaveta aberta; `null` mostra a capa com o gaveteiro. */
  activeRange: RangeId | null;
  rangeCounts: Record<RangeId, number>;
  onSelectRange: (range: RangeId | null) => void;
  terms: Term[];
  total: number;
  /** Termos que batem com os filtros, somando todas as faixas. */
  matchCount: number;
  progress: ProgressMap;
  openId: string | null;
  onOpen: (termId: string | null) => void;
  onUpdateProgress: (termId: string, patch: Partial<TermProgress>) => void;
  /** Pastas que bateram com a busca mas passaram do limite da pilha. */
  overflow: number;
}

export function FolderStack(props: FolderStackProps) {
  const { activeRange, terms, openId, progress } = props;
  const [ref, { width: containerWidth }] = useElementSize<HTMLDivElement>();
  const [liftedHeight, setLiftedHeight] = useState(0);
  // Posição na tela da gaveta clicada no gaveteiro, de onde a gaveta aberta desliza.
  const [drawerOrigin, setDrawerOrigin] = useState<number | null>(null);
  // Pasta que recebe o foco de volta quando a ficha fecha. O foco só é aceito
  // depois que a pilha deixa de ser inert, por isso fica para o efeito.
  const returnFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (openId || !returnFocusRef.current) return;
    document.getElementById(folderButtonId(returnFocusRef.current))?.focus({ preventScroll: true });
    returnFocusRef.current = null;
  }, [openId]);

  const range = RANGES.find((r) => r.id === activeRange) ?? null;

  if (!range) {
    // Mesmo contêiner medido nas duas vistas, para a largura já estar pronta ao abrir a gaveta.
    return (
      <div ref={ref}>
        <DrawerCabinet
          rangeCounts={props.rangeCounts}
          hasResults={props.matchCount > 0}
          onOpen={(rangeId, originTop) => {
            setDrawerOrigin(originTop);
            props.onSelectRange(rangeId);
          }}
        />
      </div>
    );
  }

  // Pastas + a gaveta na frente. Falsa perspectiva: cada camada à frente é um
  // pouco mais larga; em telas estreitas o passo diminui.
  const layerCount = terms.length + 1;
  const widthStep =
    layerCount > 1 ? Math.min(MAX_WIDTH_STEP, Math.floor((containerWidth * 0.26) / (layerCount - 1))) : 0;
  const widthOf = (index: number) => containerWidth - (layerCount - 1 - index) * widthStep;

  const tabFor = (term: Term, index: number, width: number, marks: { seen: boolean; review: boolean }) => {
    const tabW = tabWidthFor(term.name, width * MAX_TAB_FRACTION, marks);
    const position = TERM_TAB_POSITIONS[index % TERM_TAB_POSITIONS.length];
    return placeTab(width, tabW, position === "left" ? 18 : position === "center" ? (width - tabW) / 2 : width);
  };

  const openIndex = openId ? terms.findIndex((t) => t.id === openId) : -1;
  const openTerm = openIndex >= 0 ? terms[openIndex] : null;

  return (
    <div
      ref={ref}
      className="relative"
      // A pasta erguida pode ser mais alta que a pilha: reserva o espaço dela.
      style={{ minHeight: openTerm ? liftedHeight + 8 : undefined }}
    >
      {/* overflow: clip (e não hidden) corta os corpos altos das pastas sem criar
          uma área rolável, que o foco ou o scrollIntoView poderiam deslocar. */}
      <div className="overflow-clip pt-1" inert={openTerm !== null}>
        {containerWidth > 0 &&
          terms.map((term, index) => {
            const width = widthOf(index);
            const termProgress = progress[term.id] ?? EMPTY_PROGRESS;
            const tab = tabFor(term, index, width, termProgress);
            const open = () => props.onOpen(term.id);
            const style: CSSProperties = {
              width,
              zIndex: index + 1,
              marginTop: index === 0 ? 0 : STEP - SHEET_H,
              animationDelay: `${index * ENTER_STAGGER_MS}ms`,
              // A pasta aberta sai da pilha e deixa o vão no lugar dela.
              visibility: openId === term.id ? "hidden" : undefined,
            };

            return (
              <Sheet key={term.id} id={slotId(term.id)} style={style} width={width} tab={tab}>
                <TabLabel
                  tab={tab}
                  seen={termProgress.seen}
                  review={termProgress.review}
                  className="group-hover:underline group-hover:underline-offset-4"
                >
                  {term.name}
                </TabLabel>
                {/* Área clicável = aba + faixa visível do corpo, sem invadir a pasta de trás. */}
                <button
                  id={folderButtonId(term.id)}
                  type="button"
                  onClick={open}
                  aria-label={`${term.name}${termProgress.seen ? ", já visto" : ""}${termProgress.review ? ", marcado para revisar" : ""}`}
                  className="absolute left-0 cursor-pointer"
                  style={{ top: TAB_H, width, height: STEP }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={open}
                  className="absolute top-0 cursor-pointer"
                  style={{ left: tab.x, width: tab.width, height: TAB_H }}
                />
              </Sheet>
            );
          })}

        {containerWidth > 0 ? (
          <OpenDrawer
            key={range.id}
            origin={drawerOrigin}
            onSlid={() => setDrawerOrigin(null)}
            style={{
              position: "relative",
              zIndex: layerCount,
              // Alinha a borda de cima da gaveta onde ficaria o corpo de uma pasta.
              marginTop: terms.length === 0 ? 0 : STEP - SHEET_H + TAB_H,
            }}
          >
            <DrawerFace
              label={range.label}
              count={terms.length + props.overflow}
              height={124}
              footer={
                <p className="label px-4 text-center text-tinta-suave" aria-live="polite">
                  {props.matchCount === 0
                    ? "Nenhum arquivo encontrado"
                    : props.overflow > 0
                      ? `+${pad(props.overflow)} fora da pilha · refine a busca`
                      : "Escolha um termo e tente lembrar"}
                </p>
              }
            />
          </OpenDrawer>
        ) : null}
      </div>

      {openTerm && containerWidth > 0 ? (
        <LiftedFolder
          key={openTerm.id}
          term={openTerm}
          total={props.total}
          progress={progress[openTerm.id] ?? EMPTY_PROGRESS}
          width={widthOf(openIndex)}
          left={(containerWidth - widthOf(openIndex)) / 2}
          tab={tabFor(openTerm, openIndex, widthOf(openIndex), { seen: false, review: false })}
          stackZ={openIndex + 1}
          slotId={slotId(openTerm.id)}
          onHeightChange={setLiftedHeight}
          onReveal={() => props.onUpdateProgress(openTerm.id, { seen: true })}
          onMark={(review) => props.onUpdateProgress(openTerm.id, { seen: true, review })}
          onClosed={() => {
            returnFocusRef.current = openTerm.id;
            props.onOpen(null);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Gaveta aberta na frente da pilha. Ao montar, desliza da posição que tinha no
 * gaveteiro até aqui (FLIP), enquanto as pastas sobem de dentro dela.
 */
function OpenDrawer({
  origin: initialOrigin,
  onSlid,
  style,
  children,
}: {
  /** Topo da gaveta no gaveteiro, na tela; `null` abre sem deslizar. */
  origin: number | null;
  /** A origem foi usada e pode ser descartada. */
  onSlid: () => void;
  style: CSSProperties;
  children: ReactNode;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  // Lida uma vez na montagem: o efeito pode rodar duas vezes (Strict Mode) e
  // precisa da mesma origem nas duas.
  const [origin] = useState(initialOrigin);

  useLayoutEffect(() => {
    onSlid();
    const drawer = drawerRef.current;
    if (origin === null || !drawer || prefersReducedMotion()) return;
    const offset = origin - drawer.getBoundingClientRect().top;
    const animation = drawer.animate([{ transform: `translateY(${offset}px)` }, { transform: "none" }], {
      duration: DRAWER_SLIDE_MS,
      easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
    });
    return () => animation.cancel();
    // Só na montagem: cada gaveta aberta monta de novo (key = faixa).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={drawerRef} style={style}>
      {children}
    </div>
  );
}

function folderButtonId(termId: string) {
  return `pasta-${termId}`;
}

function slotId(termId: string) {
  return `vao-${termId}`;
}

/** Mantém a aba dentro da pasta, com respiro mínimo nas bordas. */
function placeTab(width: number, tabWidth: number, x: number): TabGeometry {
  const margin = 18;
  return { x: Math.round(Math.max(margin, Math.min(x, width - tabWidth - margin))), width: tabWidth };
}

interface SheetProps {
  id?: string;
  style: CSSProperties;
  width: number;
  tab: TabGeometry | null;
  children: ReactNode;
}

function Sheet({ id, style, width, tab, children }: SheetProps) {
  return (
    <div id={id} className="sheet-enter group relative mx-auto" style={{ ...style, height: SHEET_H }}>
      <FolderShape width={width} height={SHEET_BODY_H} tab={tab} />
      {children}
    </div>
  );
}
