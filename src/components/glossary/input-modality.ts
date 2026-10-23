"use client";

/**
 * Última forma de interação: teclado ou ponteiro. Quem move o foco por código
 * (abrir uma ficha, devolver o foco à pasta) só o faz na navegação por teclado.
 * Com o mouse o foco fica onde está e o contorno nunca aparece; o navegador
 * mostraria :focus-visible num foco programático depois de um clique.
 */
let usingKeyboard = false;

if (typeof window !== "undefined") {
  window.addEventListener(
    "keydown",
    (event) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) usingKeyboard = true;
    },
    true,
  );
  window.addEventListener("pointerdown", () => (usingKeyboard = false), true);
}

/** Move o foco para `element` só se a pessoa está navegando pelo teclado. */
export function focusForKeyboard(element: HTMLElement | null | undefined) {
  if (usingKeyboard) element?.focus({ preventScroll: true });
}
