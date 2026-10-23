"use client";

import { useLayoutEffect, useState } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Tamanho em pixels inteiros da caixa do elemento (com padding), atualizado
 * quando ele muda. Devolve um callback ref: se o elemento for trocado por outro,
 * a medição passa a seguir o novo.
 */
export function useElementSize<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!element) return;
    const update = () => {
      // Caixa inteira, com padding: contentRect desconta o padding e encolheria a pasta.
      const box = element.getBoundingClientRect();
      const next = { width: Math.floor(box.width), height: Math.ceil(box.height) };
      setSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };
    // Lê já na montagem: o observer pode demorar a disparar (ex.: aba em segundo plano).
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, size] as const;
}
