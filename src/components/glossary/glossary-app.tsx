"use client";

import { useState } from "react";
import { filterTerms, groupByRange, type GlossaryFilters } from "@/lib/glossary/filters";
import { MAX_FOLDERS_PER_STACK, RANGES, type RangeId } from "@/lib/glossary/types";
import { useGlossary } from "@/lib/glossary/use-glossary";
import { FolderStack } from "./folder-stack";
import { GlossaryFiltersBar } from "./glossary-filters";
import { GlossaryHeader } from "./glossary-header";

const INITIAL_FILTERS: GlossaryFilters = { query: "", category: null, onlyReview: false };

export function GlossaryApp() {
  const { terms, progress, updateProgress, loading } = useGlossary();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedRange, setSelectedRange] = useState<RangeId>(RANGES[0].id);
  const [openId, setOpenId] = useState<string | null>(null);

  const allTerms = terms ?? [];
  const matches = filterTerms(allTerms, progress, filters);
  const groups = groupByRange(matches);
  const rangeCounts = Object.fromEntries(RANGES.map((r) => [r.id, groups[r.id].length])) as Record<RangeId, number>;

  // Se a faixa escolhida ficou vazia com os filtros, mostra a primeira que tem resultado.
  const activeRange =
    rangeCounts[selectedRange] > 0 || matches.length === 0
      ? selectedRange
      : (RANGES.find((r) => rangeCounts[r.id] > 0)?.id ?? selectedRange);

  const stackTerms = groups[activeRange].slice(0, MAX_FOLDERS_PER_STACK);
  const overflow = groups[activeRange].length - stackTerms.length;

  const seenCount = allTerms.filter((t) => progress[t.id]?.seen).length;
  const reviewCount = allTerms.filter((t) => progress[t.id]?.review).length;

  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
      <GlossaryHeader seen={seenCount} total={allTerms.length} review={reviewCount} />
      <GlossaryFiltersBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setOpenId(null);
        }}
      />

      {loading ? (
        <p className="label py-24 text-center text-ink-muted">Abrindo arquivo…</p>
      ) : (
        <FolderStack
          terms={stackTerms}
          total={allTerms.length}
          progress={progress}
          rangeCounts={rangeCounts}
          activeRange={activeRange}
          onSelectRange={(range) => {
            setSelectedRange(range);
            setOpenId(null);
          }}
          openId={openId}
          onToggle={(termId) => setOpenId((current) => (current === termId ? null : termId))}
          onUpdateProgress={updateProgress}
          hasResults={matches.length > 0}
          overflow={overflow}
        />
      )}
    </main>
  );
}
