"use client";

import { useRef, useState } from "react";
import { filterTerms, groupByRange, type GlossaryFilters } from "@/lib/glossary/filters";
import { MAX_FOLDERS_PER_STACK, RANGES, type RangeId } from "@/lib/glossary/types";
import { useGlossary } from "@/lib/glossary/use-glossary";
import { ArchivePath } from "./archive-path";
import { FolderStack } from "./folder-stack";
import { GlossaryFiltersBar } from "./glossary-filters";
import { GlossaryHeader } from "./glossary-header";

const INITIAL_FILTERS: GlossaryFilters = { query: "", category: null, onlyReview: false };

export function GlossaryApp() {
  const { terms, progress, updateProgress, loading } = useGlossary();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  // null = arquivo fechado, mostrando só as pastas das letras.
  const [selectedRange, setSelectedRange] = useState<RangeId | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const stackTopRef = useRef<HTMLDivElement>(null);

  const allTerms = terms ?? [];
  const matches = filterTerms(allTerms, progress, filters);
  const groups = groupByRange(matches);
  const rangeCounts = Object.fromEntries(RANGES.map((r) => [r.id, groups[r.id].length])) as Record<RangeId, number>;

  // Se a faixa aberta ficou vazia com os filtros, mostra a primeira que tem resultado.
  const activeRange =
    selectedRange === null || rangeCounts[selectedRange] > 0 || matches.length === 0
      ? selectedRange
      : (RANGES.find((r) => rangeCounts[r.id] > 0)?.id ?? selectedRange);

  const rangeTerms = activeRange ? groups[activeRange] : [];
  const stackTerms = rangeTerms.slice(0, MAX_FOLDERS_PER_STACK);
  const overflow = rangeTerms.length - stackTerms.length;
  const openTerm = stackTerms.find((t) => t.id === openId) ?? null;

  const seenCount = allTerms.filter((t) => progress[t.id]?.seen).length;
  const reviewCount = allTerms.filter((t) => progress[t.id]?.review).length;

  // Mantém o topo da pilha à vista quando o nível muda, já que ele é o que muda.
  const revealStackTop = () =>
    requestAnimationFrame(() => {
      const top = stackTopRef.current;
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" });
    });

  const selectRange = (range: RangeId | null) => {
    setSelectedRange(range);
    setOpenId(null);
    revealStackTop();
  };

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
        <p className="label py-24 text-center text-tinta-suave">Abrindo arquivo…</p>
      ) : (
        <div ref={stackTopRef} className="flex scroll-mt-4 flex-col gap-5">
          <ArchivePath
            rangeLabel={RANGES.find((r) => r.id === activeRange)?.label ?? null}
            openTerm={openTerm}
            onGoToLetters={() => selectRange(null)}
            onGoToRange={() => setOpenId(null)}
          />
          <FolderStack
            activeRange={activeRange}
            rangeCounts={rangeCounts}
            onSelectRange={selectRange}
            terms={stackTerms}
            total={allTerms.length}
            matchCount={matches.length}
            progress={progress}
            openId={openTerm?.id ?? null}
            onOpen={(termId) => {
              setOpenId(termId);
              if (termId) revealStackTop();
            }}
            onUpdateProgress={updateProgress}
            overflow={overflow}
          />
        </div>
      )}
    </main>
  );
}
