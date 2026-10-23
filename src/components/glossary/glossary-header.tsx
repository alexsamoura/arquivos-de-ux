interface GlossaryHeaderProps {
  /** Os termos já chegaram: antes disso, contagens não aparecem (seriam zero). */
  ready: boolean;
  seen: number;
  total: number;
  review: number;
  /** O filtro de revisar está ligado. */
  reviewActive: boolean;
  onToggleReview: () => void;
}

/**
 * Textura de tinta do carimbo "UX": bordas levemente irregulares
 * (feTurbulence + feDisplacementMap de escala pequena) e falhas miúdas de tinta
 * (ruído fino transformado em máscara de alfa). Sutil de propósito: a palavra
 * tem que continuar nítida.
 */
function InkFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="tinta-carimbo" x="-8%" y="-15%" width="116%" height="130%" colorInterpolationFilters="sRGB">
        {/* Ondulação larga (≈12px) e deslocamento de ~±0.7px: borda irregular, não granulada. */}
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="4" result="ruido-borda" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="ruido-borda"
          scale="1.5"
          xChannelSelector="R"
          yChannelSelector="G"
          result="borda"
        />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="11" result="ruido-falhas" />
        {/* Alfa = 10 − 14·R: quase tudo opaco; só os picos do ruído viram falhas miúdas. */}
        <feColorMatrix
          in="ruido-falhas"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -14 0 0 0 10"
          result="mascara"
        />
        <feComposite in="borda" in2="mascara" operator="in" />
      </filter>
    </svg>
  );
}

export function GlossaryHeader({ ready, seen, total, review, reviewActive, onToggleReview }: GlossaryHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-tinta pb-5 sm:flex-row sm:items-end sm:justify-between">
      <InkFilter />
      <div className="flex flex-col gap-2.5">
        <h1 className="flex items-center gap-3 text-[30px] leading-none font-medium">
          Arquivos de <span className="logo-stamp text-tinta">UX</span>
        </h1>
        <p className="text-[15px] leading-snug text-tinta-suave">
          {ready ? `${total} termos de UX para consultar e revisar` : "Termos de UX para consultar e revisar"}
        </p>
      </div>
      {/* Contador (metadado). "Revisar N" liga e desliga o filtro de revisar. */}
      <p className={`label flex items-center gap-2 whitespace-nowrap ${ready ? "" : "invisible"}`}>
        <span aria-label={`${seen} de ${total} termos vistos`}>
          Vistos {seen} / {total}
        </span>
        <span aria-hidden>·</span>
        <button
          type="button"
          aria-pressed={reviewActive}
          disabled={review === 0 && !reviewActive}
          onClick={onToggleReview}
          aria-label={
            reviewActive ? "Mostrar todos os termos" : `Mostrar só os ${review} termos para revisar`
          }
          className="label -my-1.5 cursor-pointer py-1.5 underline-offset-4 hover:underline disabled:cursor-default disabled:hover:no-underline aria-pressed:underline"
        >
          Revisar {review}
        </button>
      </p>
    </header>
  );
}
