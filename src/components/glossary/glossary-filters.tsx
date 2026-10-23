"use client";

import type { GlossaryFilters } from "@/lib/glossary/filters";
import { CATEGORIES, type Category } from "@/lib/glossary/types";

interface GlossaryFiltersProps {
  filters: GlossaryFilters;
  onChange: (filters: GlossaryFilters) => void;
}

function optionClass(active: boolean) {
  return `label cursor-pointer py-1.5 ${
    active ? "text-tinta underline decoration-1 underline-offset-[5px]" : "text-tinta-suave hover:text-tinta"
  }`;
}

export function GlossaryFiltersBar({ filters, onChange }: GlossaryFiltersProps) {
  const setCategory = (category: Category | null) => onChange({ ...filters, category });

  return (
    <section aria-label="Busca e filtros" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border border-tinta bg-papel px-3">
        <label htmlFor="busca" className="label shrink-0">
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
          <button type="button" className="label shrink-0 py-2 hover:underline" onClick={() => onChange({ ...filters, query: "" })}>
            Limpar
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div role="group" aria-label="Categoria" className="flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" aria-pressed={filters.category === null} onClick={() => setCategory(null)} className={optionClass(filters.category === null)}>
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

        {/* Checkbox nativo (teclado, leitor de tela e clique no rótulo de graça),
            redesenhado com contorno de 1px e tique de traço fino. */}
        <label className="label flex cursor-pointer items-center gap-2 py-1.5">
          <span className="relative inline-flex size-4 shrink-0">
            <input
              type="checkbox"
              checked={filters.onlyReview}
              onChange={(event) => onChange({ ...filters, onlyReview: event.target.checked })}
              className="peer size-4 cursor-pointer appearance-none border border-tinta bg-papel checked:bg-tinta"
            />
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="pointer-events-none absolute inset-0 hidden text-papel peer-checked:block"
            >
              <path d="M4 8.4 L6.8 11.2 L12 5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Só revisar
        </label>
      </div>
    </section>
  );
}
