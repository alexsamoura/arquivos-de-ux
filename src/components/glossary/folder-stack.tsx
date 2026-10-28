"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { normalize } from "@/lib/glossary/filters";
import { EMPTY_PROGRESS, type Drawer, type DrawerId, type ProgressMap, type Term, type TermProgress } from "@/lib/glossary/types";
import { DrawerCabinet, DrawerFace, termCount } from "./drawer-cabinet";
import { FolderShape, HALF_STROKE, STEP, STROKE, TAB_H, TabLabel, tabWidthFor, type TabGeometry } from "./folder-shape";
import { focusForKeyboard } from "./input-modality";
import { LIFT_BASE_Y, LIFT_EASE, LiftedFolder, prefersReducedMotion } from "./lifted-folder";
import { useElementSize } from "./use-element-size";

/** Altura de layout de uma pasta fechada: aba + faixa visível + folga escondida. */
const SHEET_H = TAB_H + STEP + 8;
/**
 * Altura desenhada da pasta, da aba à base. A base passa um pouco da faixa
 * visível e fica sob a pasta seguinte, que é desenhada por cima.
 */
const SHEET_BODY_H = TAB_H + STEP + 12;
/** Respiro no topo da pilha, para o contorno de foco da primeira aba. */
const PILE_PT = 4;
const DRAWER_FRONT_H = 120;
/** Distância entre as duas linhas de cada parede lateral. */
const WALL_THICKNESS = 6;
/** Quanto a parede do fundo fica acima da borda de cima da primeira pasta. */
const BACK_WALL_RISE = 10;
/**
 * Medidas que variam com a largura: no desktop, as pedidas (folga de 8px e frente
 * 12px mais larga que a caixa); em telas estreitas, menores, para os nomes longos
 * com carimbo caberem inteiros nas abas.
 */
const SPACING = {
  wide: { folderGap: 8, frontOverhang: 12, tabMargin: 10, maxWidthStep: 12, budget: 0.24 },
  narrow: { folderGap: 6, frontOverhang: 6, tabMargin: 4, maxWidthStep: 2, budget: 0.06 },
};
const NARROW_WIDTH = 480;
const TERM_TAB_POSITIONS = ["left", "center", "right"] as const;
/** Intervalo entre a entrada de uma pasta e a próxima ao abrir a gaveta. */
const ENTER_STAGGER_MS = 30;
const DRAWER_SLIDE_MS = 460;

interface FolderStackProps {
  drawers: Drawer[];
  /** Gaveta aberta; `null` mostra a capa com o gaveteiro. */
  activeRange: DrawerId | null;
  rangeCounts: Record<DrawerId, number>;
  onSelectRange: (range: DrawerId | null) => void;
  terms: Term[];
  total: number;
  /** Termos que batem com os filtros, somando todas as faixas. */
  matchCount: number;
  progress: ProgressMap;
  openId: string | null;
  onOpen: (termId: string | null) => void;
  onUpdateProgress: (termId: string, patch: Partial<TermProgress>) => void;
}

type Layer =
  | { kind: "divider"; letter: string; key: string }
  | { kind: "term"; term: Term; termIndex: number; key: string };

/** Pastas na ordem da pilha, com uma divisória antes do primeiro termo de cada letra. */
function buildLayers(terms: Term[]): Layer[] {
  const layers: Layer[] = [];
  let previous = "";
  terms.forEach((term, termIndex) => {
    const letter = normalize(term.name).charAt(0).toUpperCase();
    if (letter !== previous) {
      layers.push({ kind: "divider", letter, key: `letra-${letter}` });
      previous = letter;
    }
    layers.push({ kind: "term", term, termIndex, key: term.id });
  });
  return layers;
}

/**
 * Geometria única da gaveta, lida por pastas, paredes e frente.
 *
 * A caixa se abre para baixo: a parede externa esquerda fica em
 * `frontOverhang` na base (onde a frente começa) e sobe para dentro meio passo
 * a cada `STEP`. A interna fica `WALL_THICKNESS` para dentro dela. Cada pasta
 * fica `folderGap` para dentro da parede interna, medida na borda de cima da
 * pasta. Como as laterais da pasta são verticais e a parede é diagonal, a folga
 * cresce até a pasta seguinte e as laterais formam uma escadinha.
 *
 * Passo de alargamento (`widthStep`): sai do número de pastas e da largura
 * disponível. A última pasta tem sempre a largura máxima entre as paredes
 * (`containerWidth − 2·base`); daí para trás, cada pasta perde um passo. O espaço
 * que a perspectiva pode consumir é uma fração (`budget`) dessa largura, dividido
 * pelo número de pastas: com mais pastas, o passo diminui, e a primeira pasta
 * nunca fica estreita demais. O passo é par, para os cantos caírem em pixel
 * inteiro, e desce até todas as abas daquela gaveta caberem inteiras.
 */
function drawerGeometry(containerWidth: number, layerCount: number, tabWidths: number[]) {
  const spacing = containerWidth < NARROW_WIDTH ? SPACING.narrow : SPACING.wide;
  const bodyTop = (index: number) => PILE_PT + TAB_H + index * STEP;
  const frontTop = bodyTop(layerCount);
  const base = spacing.frontOverhang + WALL_THICKNESS + spacing.folderGap;
  const maxFolderWidth = containerWidth - 2 * base;
  const widthFor = (step: number, index: number) => maxFolderWidth - (layerCount - index) * step;
  const fits = (step: number) =>
    tabWidths.every((tabWidth, index) => tabWidth + 2 * spacing.tabMargin <= widthFor(step, index));

  const perspectiveRoom = maxFolderWidth * spacing.budget;
  let widthStep = Math.min(
    spacing.maxWidthStep,
    Math.max(2, 2 * Math.floor(perspectiveRoom / Math.max(1, layerCount) / 2)),
  );
  while (widthStep > 0 && !fits(widthStep)) widthStep -= 2;
  const spread = widthStep / 2 / STEP;
  const wallsTop = bodyTop(0) - BACK_WALL_RISE;
  const outerAt = (y: number) => spacing.frontOverhang + (frontTop - y) * spread;
  const innerAt = (y: number) => outerAt(y) + WALL_THICKNESS;

  return {
    tabMargin: spacing.tabMargin,
    widthOf: (index: number) => widthFor(widthStep, index),
    /**
     * Largura máxima de uma pasta cuja borda de cima do corpo está na altura `y`
     * (coordenadas da pilha), com a folga das paredes. Acima da parede do fundo,
     * vale a largura de lá. Em `bodyTop(i)` é igual a `widthOf(i)`.
     */
    bodyWidthAt: (y: number) => containerWidth - 2 * (innerAt(Math.max(y, wallsTop)) + spacing.folderGap),
    frontTop,
    walls: {
      top: wallsTop,
      /** As paredes descem até sob a borda dupla da frente. */
      bottom: frontTop + 8,
      outerAt,
      innerAt,
    },
  };
}

type DrawerGeometry = ReturnType<typeof drawerGeometry>;

export function FolderStack(props: FolderStackProps) {
  const { activeRange, terms, openId, progress } = props;
  const [ref, { width: containerWidth }] = useElementSize<HTMLDivElement>();
  const [liftedHeight, setLiftedHeight] = useState(0);
  // A pasta erguida começou a voltar: o espaço aberto acima da pilha recolhe junto.
  const [liftClosing, setLiftClosing] = useState(false);
  // Topo, na tela, da gaveta clicada no gaveteiro: de onde a gaveta aberta desliza.
  const [drawerOrigin, setDrawerOrigin] = useState<number | null>(null);
  // Gaveta que acabou de fechar, para devolver o foco a ela no gaveteiro.
  const [closedRange, setClosedRange] = useState<DrawerId | null>(null);
  // Pasta que recebe o foco de volta quando a ficha fecha.
  const returnFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (openId || !returnFocusRef.current) return;
    focusForKeyboard(document.getElementById(folderButtonId(returnFocusRef.current)));
    returnFocusRef.current = null;
  }, [openId]);

  const range = props.drawers.find((d) => d.id === activeRange) ?? null;

  const closeDrawer = () => {
    if (!range) return;
    setClosedRange(range.id);
    props.onSelectRange(null);
  };

  // Esc fecha a gaveta quando não há ficha aberta (com ficha, o Esc fecha a ficha).
  const escapeRef = useRef<() => void>(() => {});
  useEffect(() => {
    escapeRef.current = () => {
      if (range && !openId) closeDrawer();
    };
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") escapeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!range) {
    // Mesmo contêiner medido nas duas vistas, para a largura já estar pronta ao abrir a gaveta.
    return (
      <div ref={ref}>
        <DrawerCabinet
          drawers={props.drawers}
          rangeCounts={props.rangeCounts}
          focusRange={closedRange}
          hasResults={props.matchCount > 0}
          onOpen={(rangeId, originTop) => {
            setDrawerOrigin(originTop);
            props.onSelectRange(rangeId);
          }}
        />
      </div>
    );
  }

  const layers = buildLayers(terms);
  const marksOf = (term: Term) => (openId === term.id ? {} : (progress[term.id] ?? EMPTY_PROGRESS));
  // Largura que cada aba precisa, sem limite: a geometria escolhe o passo em que todas cabem.
  const tabWidths = layers.map((layer) =>
    layer.kind === "term" ? tabWidthFor(layer.term.name, Infinity, marksOf(layer.term)) : tabWidthFor("M", Infinity),
  );
  const geometry = drawerGeometry(containerWidth, layers.length, tabWidths);
  const { widthOf } = geometry;

  const openLayerIndex = openId ? layers.findIndex((l) => l.kind === "term" && l.term.id === openId) : -1;
  // A ficha sobe acima do lugar dela; se não couber, a pilha desce para abrir espaço.
  const liftSpace =
    openLayerIndex >= 0 && !liftClosing
      ? Math.max(0, liftedHeight - LIFT_BASE_Y - openLayerIndex * STEP)
      : 0;

  return (
    <div ref={ref}>
      {/* overflow: clip (e não hidden) corta o que passa da frente da gaveta sem criar
          uma área rolável, que o foco ou o scrollIntoView poderiam deslocar. */}
      <div
        className="overflow-clip motion-safe:transition-[padding] motion-safe:duration-[480ms]"
        style={{ paddingTop: liftSpace, transitionTimingFunction: LIFT_EASE }}
      >
        <div className="relative" style={{ paddingTop: PILE_PT }}>
          {containerWidth > 0 && layers.length > 0 ? (
            <DrawerWalls width={containerWidth} walls={geometry.walls} />
          ) : null}

          {containerWidth > 0 &&
            layers.map((layer, index) => {
              const width = widthOf(index);
              const style: CSSProperties = {
                width,
                zIndex: index + 1,
                marginTop: index === 0 ? 0 : STEP - SHEET_H,
                animationDelay: `${index * ENTER_STAGGER_MS}ms`,
              };

              if (layer.kind === "divider") {
                return (
                  <DividerSheet
                    key={layer.key}
                    style={style}
                    width={width}
                    letter={layer.letter}
                    range={range}
                  />
                );
              }

              const { term } = layer;
              const termProgress = progress[term.id] ?? EMPTY_PROGRESS;
              const isOpen = openId === term.id;
              const tab = tabFor(term.name, layer.termIndex, width, marksOf(term), geometry.tabMargin);
              const open = () => props.onOpen(term.id);

              return (
                <Sheet
                  key={layer.key}
                  id={slotId(term.id)}
                  style={style}
                  width={width}
                  tab={tab}
                  drawn={!isOpen}
                >
                  {isOpen ? (
                    <LiftedFolder
                      term={term}
                      total={props.total}
                      progress={termProgress}
                      sheetWidth={width}
                      fitWidth={(height) => {
                        // Borda de cima do corpo da pasta erguida, nas coordenadas da pilha.
                        const bodyTop = PILE_PT + index * STEP + LIFT_BASE_Y - height + TAB_H;
                        const inset = Math.ceil((width - geometry.bodyWidthAt(bodyTop)) / 2);
                        return width - 2 * Math.max(0, inset);
                      }}
                      tabForWidth={(liftedWidth) =>
                        tabFor(term.name, layer.termIndex, liftedWidth, {}, geometry.tabMargin)
                      }
                      onHeightChange={setLiftedHeight}
                      onOpened={() => {
                        setLiftClosing(false);
                        props.onUpdateProgress(term.id, { seen: true });
                      }}
                      onClosingStart={() => setLiftClosing(true)}
                      onMark={(review) => props.onUpdateProgress(term.id, { seen: true, review })}
                      onClosed={() => {
                        returnFocusRef.current = term.id;
                        setLiftClosing(false);
                        props.onOpen(null);
                      }}
                    />
                  ) : (
                    <>
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
                    </>
                  )}
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
                zIndex: layers.length + 1,
                // A borda de cima da frente fica na base da última pasta.
                marginTop: layers.length === 0 ? 0 : STEP - SHEET_H + TAB_H,
              }}
            >
              {/* Só a frente fecha a gaveta: clicar nas pastas nunca fecha. */}
              <button
                type="button"
                onClick={closeDrawer}
                aria-label={`Fechar gaveta ${range.label}, ${termCount(terms.length)}`}
                className="block w-full cursor-pointer motion-safe:transition-transform motion-safe:duration-150 hover:translate-y-[3px] focus-visible:translate-y-[3px]"
              >
                <DrawerFace
                  label={range.label}
                  height={DRAWER_FRONT_H}
                  panelWidth={containerWidth}
                  // A frente mostra só a etiqueta; o aviso aparece apenas quando a busca não acha nada.
                  footer={
                    props.matchCount === 0 ? (
                      <span className="label block px-4 text-center text-tinta-suave" role="status">
                        Nenhum arquivo encontrado
                      </span>
                    ) : undefined
                  }
                />
              </button>
            </OpenDrawer>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function tabFor(
  name: string,
  termIndex: number,
  width: number,
  marks: { seen?: boolean; review?: boolean },
  margin: number,
) {
  const tabW = tabWidthFor(name, width - 2 * margin, marks);
  const position = TERM_TAB_POSITIONS[termIndex % TERM_TAB_POSITIONS.length];
  return placeTab(width, tabW, position === "left" ? 18 : position === "center" ? (width - tabW) / 2 : width, margin);
}

/**
 * Paredes da gaveta, atrás das pastas: cada lateral são duas linhas paralelas
 * (externa e interna, a `WALL_THICKNESS`), fechadas em cima por um traço curto,
 * e a parede do fundo é uma linha horizontal entre elas. As linhas descem até
 * sob a frente, que é desenhada por cima.
 */
function DrawerWalls({ width, walls }: { width: number; walls: DrawerGeometry["walls"] }) {
  const { top, bottom, outerAt, innerAt } = walls;
  const y0 = top + HALF_STROKE;
  const left = (x: number) => x + HALF_STROKE;
  const right = (x: number) => width - x - HALF_STROKE;
  const side = (at: (x: number) => number) =>
    `M${at(outerAt(bottom))} ${bottom} L${at(outerAt(top))} ${y0} L${at(innerAt(top))} ${y0} L${at(innerAt(bottom))} ${bottom}`;

  return (
    <svg
      aria-hidden
      width={width}
      height={bottom}
      viewBox={`0 0 ${width} ${bottom}`}
      className="pointer-events-none absolute top-0 left-0 block"
      style={{ zIndex: 0 }}
    >
      <path
        d={`${side(left)} ${side(right)} M${left(innerAt(top))} ${y0} H${right(innerAt(top))}`}
        fill="none"
        stroke="var(--tinta)"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Divisória com aba escura e a letra, antes do primeiro termo daquela letra. */
function DividerSheet({
  style,
  width,
  letter,
  range,
}: {
  style: CSSProperties;
  width: number;
  letter: string;
  range: Drawer;
}) {
  // A posição da aba acompanha a letra dentro da faixa, como em divisórias de arquivo.
  const span = Math.max(1, range.to.charCodeAt(0) - range.from.charCodeAt(0));
  const fraction = (letter.toLowerCase().charCodeAt(0) - range.from.charCodeAt(0)) / span;
  const tabW = tabWidthFor("M", width);
  const tab = placeTab(width, tabW, 18 + fraction * (width - tabW - 36));

  return (
    <Sheet style={style} width={width} tab={tab} filledTab>
      <TabLabel tab={tab} className="text-papel">
        {letter}
      </TabLabel>
    </Sheet>
  );
}

/**
 * Frente da gaveta aberta. Ao montar, desliza da posição que tinha no gaveteiro
 * até aqui (FLIP), enquanto as pastas sobem de dentro da gaveta.
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
      easing: LIFT_EASE,
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
function placeTab(width: number, tabWidth: number, x: number, margin = SPACING.wide.tabMargin): TabGeometry {
  return { x: Math.round(Math.max(margin, Math.min(x, width - tabWidth - margin))), width: tabWidth };
}

interface SheetProps {
  id?: string;
  style: CSSProperties;
  width: number;
  tab: TabGeometry | null;
  filledTab?: boolean;
  /** Falso quando a pasta está erguida e ela mesma se desenha. */
  drawn?: boolean;
  children: ReactNode;
}

/** Pasta fechada: forma completa (aba, laterais curtas, base), por cima da base da anterior. */
function Sheet({ id, style, width, tab, filledTab, drawn = true, children }: SheetProps) {
  return (
    <div id={id} className="superficie sheet-enter group relative mx-auto" style={{ ...style, height: SHEET_H }}>
      {drawn ? (
        <FolderShape width={width} height={SHEET_BODY_H} tab={tab} filledTab={filledTab} />
      ) : null}
      {children}
    </div>
  );
}
