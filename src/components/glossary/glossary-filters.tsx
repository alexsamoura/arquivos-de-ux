"use client";

import type { GlossaryFilters } from "@/lib/glossary/filters";
import { CATEGORIES, type Category } from "@/lib/glossary/types";

interface GlossaryFiltersProps {
  filters: GlossaryFilters;
  onChange: (filters: GlossaryFilters) => void;
}

function optionClass(active: boolean) {
  return `label cursor-pointer py-1.5 ${
    active ? "text-ink underline decoration-1 underline-offset-[5px]" : "text-ink-muted hover:text-ink"
  }`;
}

export function GlossaryFiltersBar({ filters, onChange }: GlossaryFiltersProps) {
  const setCategory = (category: Category | null) => onChange({ ...filters, category });

  return (
    <section aria-label="Busca e filtros" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border border-ink bg-folder px-3">
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
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] placeholder:text-ink-muted focus:outline-none"
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

        <button
          type="button"
          role="switch"
          aria-checked={filters.onlyReview}
          onClick={() => onChange({ ...filters, onlyReview: !filters.onlyReview })}
          className={optionClass(filters.onlyReview)}
        >
          {filters.onlyReview ? "[X]" : "[ ]"} Só revisar
        </button>
      </div>
    </section>
  );
}
