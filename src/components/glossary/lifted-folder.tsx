"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Term, TermProgress } from "@/lib/glossary/types";
import { FolderShape, ReviewStamp, STEP, TAB_H, TabLabel, type TabGeometry } from "./folder-shape";
import { focusForKeyboard } from "./input-modality";
import { useElementSize } from "./use-element-size";

const OPEN_MS = 480;
const CLOSE_MS = 380;
export const LIFT_EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
/**
 * Onde fica a base da pasta erguida, medida do topo da camada dela na pilha:
 * abaixo da aba da pasta da frente, que segue desenhada por cima dessa base.
 */
export const LIFT_BASE_Y = STEP + TAB_H + 8;
/** Parte de baixo da pasta que fica atrás da pasta da frente; o conteúdo termina acima. */
const HIDDEN_BASE_H = LIFT_BASE_Y - STEP;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface LiftedFolderProps {
  term: Term;
  total: number;
  progress: TermProgress;
  /** Largura da camada da pilha onde a pasta está. */
  sheetWidth: number;
  /**
   * Largura máxima, entre as paredes da gaveta, para a pasta erguida com esta
   * altura: quanto mais alta, mais acima ela termina, onde a gaveta é mais estreita.
   */
  fitWidth: (height: number) => number;
  /** Aba da pasta erguida, para a largura que ela tiver. */
  tabForWidth: (width: number) => TabGeometry;
  onHeightChange: (height: number) => void;
  /** A pasta começou a voltar: a pilha pode recolher o espaço aberto acima dela. */
  onClosingStart: () => void;
  onOpened: () => void;
  onMark: (review: boolean) => void;
  /** Chamado depois que a pasta voltou à pilha. */
  onClosed: () => void;
}

/**
 * Pasta erguida, desenhada dentro da própria camada da pilha: as pastas da frente
 * continuam por cima da base dela, e as de trás ficam atrás.
 */
export function LiftedFolder(props: LiftedFolderProps) {
  const { term, total, progress, sheetWidth, onHeightChange } = props;
  const [closing, setClosing] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const [contentRef, contentSize] = useElementSize<HTMLDivElement>();
  const measured = contentSize.height > 0;
  // A pasta erguida não pode passar das paredes onde ela termina. Estreitar faz o
  // texto quebrar e a pasta crescer, o que a leva mais para cima e pode estreitá-la
  // de novo; a largura só diminui, então converge em poucas renderizações. Ela só
  // aparece quando a altura medida corresponde à largura atual (`settled`).
  const width = measured ? Math.min(sheetWidth, props.fitWidth(TAB_H + contentSize.height)) : sheetWidth;
  const settled = measured && contentSize.width === width;
  const height = TAB_H + contentSize.height;
  const tab = props.tabForWidth(width);
  // Deslocamento que põe a pasta de volta no lugar dela, em repouso na pilha.
  const restOffset = height - LIFT_BASE_Y;

  useLayoutEffect(() => {
    if (settled) onHeightChange(height);
  }, [settled, height, onHeightChange]);

  // A ficha abre já com a definição: conta como vista.
  useEffect(() => {
    props.onOpened();
    // Só na montagem: cada abertura monta uma pasta nova.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sobe do lugar dela na pilha assim que largura e altura se acertam.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!settled || !root || startedRef.current) return;
    startedRef.current = true;
    focusForKeyboard(root);
    const bringIntoView = () =>
      root.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    if (prefersReducedMotion()) {
      bringIntoView();
      return;
    }
    const animation = root.animate([{ transform: `translateY(${restOffset}px)` }, { transform: "none" }], {
      duration: OPEN_MS,
      easing: LIFT_EASE,
    });
    animation.onfinish = bringIntoView;
  }, [settled, restOffset]);

  /**
   * `afterClose` roda só depois que a pasta voltou: marcar "Já sabia" com o filtro
   * "Só revisar" ligado tira o termo da pilha, e a camada precisa existir até lá.
   */
  function close(afterClose?: () => void) {
    if (closing) return;
    const finish = () => {
      props.onClosed();
      afterClose?.();
    };
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      finish();
      return;
    }
    setClosing(true);
    props.onClosingStart();
    const animation = root.animate([{ transform: "none" }, { transform: `translateY(${restOffset}px)` }], {
      duration: CLOSE_MS,
      easing: LIFT_EASE,
      fill: "forwards",
    });
    animation.onfinish = finish;
  }

  // Esc fecha a ficha (a pilha só trata o Esc quando não há ficha aberta).
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const titleId = `ficha-${term.id}-titulo`;
  const buttonClass = "label cursor-pointer border border-tinta px-3 py-2.5 hover:bg-tinta hover:text-papel";

  return (
    <section
      ref={rootRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="absolute focus:outline-none"
      style={{
        top: LIFT_BASE_Y - height,
        left: (sheetWidth - width) / 2,
        width,
        visibility: settled ? "visible" : "hidden",
      }}
    >
      <FolderShape width={width} height={Math.max(height, TAB_H + 1)} tab={tab} />
      {/* Na aba só o nome: o carimbo de revisar aparece uma vez, ao lado do título. */}
      <TabLabel tab={tab} className="underline underline-offset-4">
        {term.name}
      </TabLabel>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => close()}
        className="absolute top-0 cursor-pointer"
        style={{ left: tab.x, width: tab.width, height: TAB_H }}
      />

      <div
        ref={contentRef}
        className="relative px-5 pt-4 sm:px-6"
        style={{ marginTop: TAB_H, paddingBottom: HIDDEN_BASE_H + 16 }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="label leading-snug text-tinta-suave">
            Ficha {term.number} de {total} · {term.category}
          </p>
          <button type="button" onClick={() => close()} className="label -m-2 cursor-pointer p-2 hover:underline">
            Fechar
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <h3 id={titleId} className="text-[18px] leading-snug font-medium tracking-[0.04em] uppercase">
            {term.name}
          </h3>
          {progress.review ? <ReviewStamp /> : null}
        </div>
        {term.synonyms.length > 0 ? (
          <p className="mt-2 text-[13px] leading-snug text-tinta-suave">
            <span className="label mr-2">Também</span>
            {term.synonyms.join(" · ")}
          </p>
        ) : null}

        <dl className="mt-5 flex flex-col gap-4 border-t border-tinta pt-5">
          <FolderField label="Definição">{term.definition}</FolderField>
          <FolderField label="Exemplo">{term.example}</FolderField>
          <FolderField label="Dica">{term.tip}</FolderField>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={buttonClass} onClick={() => close(() => props.onMark(false))}>
            Já sabia
          </button>
          <button type="button" className={buttonClass} onClick={() => close(() => props.onMark(true))}>
            Revisar depois
          </button>
        </div>
      </div>
    </section>
  );
}

function FolderField({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <dt className="label text-tinta-suave">{label}</dt>
      <dd className="mt-1.5 font-serif text-[16px] leading-relaxed">{children}</dd>
    </div>
  );
}
