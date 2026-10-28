"use client";

import type { GlossaryFilters } from "@/lib/glossary/filters";
import { CATEGORIES, type Category } from "@/lib/glossary/types";

interface GlossaryFiltersProps {
  filters: GlossaryFilters;
  onChange: (filters: GlossaryFilters) => void;
}

/**
 * Controles em caixa normal, no tamanho do conteúdo (15px); caixa alta fica só nos
 * metadados. O ativo vira uma etiqueta creme com sublinhado magenta: o magenta
 * só tem contraste sobre o creme, não direto no fundo escuro.
 */
function optionClass(active: boolean) {
  return `cursor-pointer px-2 py-1 text-[15px] ${
    active
      ? "superficie bg-papel underline decoration-destaque decoration-2 underline-offset-[5px]"
      : "text-tinta-suave hover:text-tinta"
  }`;
}

export function GlossaryFiltersBar({ filters, onChange }: GlossaryFiltersProps) {
  const setCategory = (category: Category | null) => onChange({ ...filters, category });

  return (
    <section aria-label="Busca e filtros" className="flex flex-col gap-3">
      <div className="superficie flex items-center gap-3 border-2 border-tinta bg-papel px-3">
        <label htmlFor="busca" className="shrink-0 text-[15px]">
          Buscar
        </label>
        <input
          id="busca"
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="nome ou definição"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] placeholder:text-tinta-suave focus:outline-none"
        />
        {filters.query ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer py-2 text-[15px] hover:underline"
            onClick={() => onChange({ ...filters, query: "" })}
          >
            Limpar
          </button>
        ) : null}
      </div>

      <div role="group" aria-label="Categoria" className="flex flex-wrap gap-x-4 gap-y-1">
        <button
          type="button"
          aria-pressed={filters.category === null}
          onClick={() => setCategory(null)}
          className={optionClass(filters.category === null)}
        >
          Todas
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filters.category === category}
            onClick={() => setCategory(filters.category === category ? null : category)}
            className={optionClass(filters.category === category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* O filtro de revisar é ligado pelo "Revisar N" do contador; aqui fica visível
          enquanto está ativo, com o jeito de desligar. */}
      {filters.onlyReview ? (
        <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
          <span>Mostrando só os termos para revisar.</span>
          <button
            type="button"
            className="cursor-pointer underline underline-offset-4 hover:text-tinta-suave"
            onClick={() => onChange({ ...filters, onlyReview: false })}
          >
            Mostrar todos
          </button>
        </p>
      ) : null}
    </section>
  );
}
