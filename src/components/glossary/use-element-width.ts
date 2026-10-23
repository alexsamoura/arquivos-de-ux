"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Largura em pixels inteiros do elemento, atualizada quando ele muda de tamanho. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Lê na montagem: o observer pode demorar a disparar (ex.: aba em segundo plano).
    setWidth(Math.floor(element.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
