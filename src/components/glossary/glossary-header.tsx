import { pad } from "@/lib/glossary/filters";

interface GlossaryHeaderProps {
  seen: number;
  total: number;
  review: number;
}

export function GlossaryHeader({ seen, total, review }: GlossaryHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-[18px] leading-snug font-medium">Glossário de UX — Arquivo de Termos</h1>
      <p className="label whitespace-nowrap" aria-label={`${seen} de ${total} termos vistos, ${review} para revisar`}>
        Vistos {pad(seen)} / {pad(total)} · Revisar {pad(review)}
      </p>
    </header>
  );
}
