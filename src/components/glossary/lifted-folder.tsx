"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Term, TermProgress } from "@/lib/glossary/types";
import { FolderShape, ReviewStamp, TAB_H, TabLabel, type TabGeometry } from "./folder-shape";
import { useElementSize } from "./use-element-size";

const OPEN_MS = 480;
const CLOSE_MS = 380;
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
/** Acima de todas as pastas e do véu que esmaece a pilha. */
const Z_LIFTED = 100;
const Z_VEIL = 90;

/**
 * opening: sobe de trás das pastas da frente · open: no topo, acima do véu ·
 * closing: desce de volta para o vão, de novo atrás das pastas da frente.
 */
type LiftPhase = "opening" | "open" | "closing";

interface LiftedFolderProps {
  term: Term;
  total: number;
  progress: TermProgress;
  width: number;
  left: number;
  tab: TabGeometry;
  /** z-index da pasta na pilha, usado enquanto ela entra e sai. */
  stackZ: number;
  /** id do vão deixado na pilha, origem e destino da animação. */
  slotId: string;
  onHeightChange: (height: number) => void;
  onReveal: () => void;
  onMark: (review: boolean) => void;
  /** Chamado depois que a pasta voltou à pilha. */
  onClosed: () => void;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LiftedFolder(props: LiftedFolderProps) {
  const { term, total, progress, width, left, tab, stackZ, slotId, onHeightChange } = props;
  const [revealed, setRevealed] = useState(false);
  // Sem animação, a pasta já nasce aberta: só troca de estado.
  const [phase, changePhase] = useState<LiftPhase>(() => (prefersReducedMotion() ? "open" : "opening"));
  const rootRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLButtonElement>(null);
  const definitionRef = useRef<HTMLDivElement>(null);
  const [contentRef, contentSize] = useElementSize<HTMLDivElement>();
  const height = TAB_H + contentSize.height;

  const slotOffset = () => {
    const root = rootRef.current;
    const slot = document.getElementById(slotId);
    if (!root || !slot) return null;
    return slot.getBoundingClientRect().top - root.getBoundingClientRect().top;
  };

  useLayoutEffect(() => {
    onHeightChange(height);
  }, [height, onHeightChange]);

  // FLIP: a pasta nasce no topo e é deslocada até o vão, de onde sobe.
  useLayoutEffect(() => {
    revealRef.current?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    const offset = slotOffset();
    if (offset === null) {
      const frame = requestAnimationFrame(() => changePhase("open"));
      return () => cancelAnimationFrame(frame);
    }
    const animation = rootRef.current!.animate(
      [{ transform: `translateY(${offset}px)` }, { transform: "none" }],
      { duration: OPEN_MS, easing: EASE },
    );
    animation.onfinish = () => changePhase("open");
    return () => animation.cancel();
    // Só na montagem: cada abertura monta uma pasta nova.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * `afterClose` roda só depois que a pasta voltou: marcar "Lembrei" com o filtro
   * "Só revisar" ligado tira o termo da pilha, e o vão precisa existir até lá.
   */
  function close(afterClose?: () => void) {
    if (phase === "closing") return;
    const finish = () => {
      props.onClosed();
      afterClose?.();
    };
    const offset = slotOffset();
    if (offset === null || prefersReducedMotion()) {
      finish();
      return;
    }
    changePhase("closing");
    const animation = rootRef.current!.animate(
      [{ transform: "none" }, { transform: `translateY(${offset}px)` }],
      { duration: CLOSE_MS, easing: EASE, fill: "forwards" },
    );
    animation.onfinish = finish;
  }

  function reveal() {
    setRevealed(true);
    props.onReveal();
    requestAnimationFrame(() => definitionRef.current?.focus({ preventScroll: true }));
  }

  const titleId = `ficha-${term.id}-titulo`;
  const buttonClass = "label cursor-pointer border border-tinta px-3 py-2.5 hover:bg-tinta hover:text-papel";

  return (
    <>
      {/* Véu sobre a pilha inteira: escurece com a própria tinta e desfoca, de uma
          vez só (opacity em cada pasta deixaria ver as de trás). Clicar nele fecha. */}
      <div
        aria-hidden
        onClick={() => close()}
        className="absolute -inset-x-2 inset-y-0 backdrop-blur-[2.5px] motion-safe:transition-opacity motion-safe:duration-200"
        style={{
          zIndex: Z_VEIL,
          backgroundColor: "color-mix(in srgb, var(--tinta) 22%, transparent)",
          opacity: phase === "open" ? 1 : 0,
          pointerEvents: phase === "open" ? "auto" : "none",
        }}
      />
      <section
        ref={rootRef}
        aria-labelledby={titleId}
        className="absolute top-0"
        style={{ left, width, zIndex: phase === "open" ? Z_LIFTED : stackZ }}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
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

        <div ref={contentRef} className="relative px-5 pt-4 pb-6 sm:px-6" style={{ marginTop: TAB_H }}>
          <div className="flex items-start justify-between gap-4">
            <p className="label leading-snug text-tinta-suave">
              Ficha {term.number} de {total} · {term.category}
            </p>
            <button type="button" onClick={() => close()} className="label -m-2 cursor-pointer p-2 hover:underline">
              Fechar
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h2 id={titleId} className="text-[18px] leading-snug font-medium tracking-[0.04em] uppercase">
              {term.name}
            </h2>
            {progress.review ? <ReviewStamp /> : null}
          </div>

          {revealed ? (
            <div ref={definitionRef} tabIndex={-1} className="focus:outline-none">
              <dl className="mt-5 flex flex-col gap-4 border-t border-tinta pt-5">
                <FolderField label="Definição">{term.definition}</FolderField>
                <FolderField label="Exemplo">{term.example}</FolderField>
                <FolderField label="Dica">{term.tip}</FolderField>
              </dl>
              <p className="label mt-7 text-tinta-suave">Você lembrou?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={buttonClass} onClick={() => close(() => props.onMark(false))}>
                  Lembrei
                </button>
                <button type="button" className={buttonClass} onClick={() => close(() => props.onMark(true))}>
                  Revisar depois
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <button ref={revealRef} type="button" className={buttonClass} onClick={reveal}>
                Ver definição
              </button>
            </div>
          )}
        </div>
      </section>
    </>
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
