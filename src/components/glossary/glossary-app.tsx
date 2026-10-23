"use client";

import { useMemo, useRef, useState } from "react";
import { buildDrawers, groupByDrawer } from "@/lib/glossary/drawers";
import { filterTerms, type GlossaryFilters } from "@/lib/glossary/filters";
import { MAX_FOLDERS_PER_STACK, type DrawerId } from "@/lib/glossary/types";
import { useGlossary } from "@/lib/glossary/use-glossary";
import { ArchivePath } from "./archive-path";
import { FolderStack } from "./folder-stack";
import { GlossaryFiltersBar } from "./glossary-filters";
import { GlossaryHeader } from "./glossary-header";

const INITIAL_FILTERS: GlossaryFilters = { query: "", category: null, onlyReview: false };

export function GlossaryApp() {
  const { terms, progress, updateProgress, loading } = useGlossary();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  // null = arquivo fechado, mostrando o gaveteiro.
  const [selectedRange, setSelectedRange] = useState<DrawerId | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const stackTopRef = useRef<HTMLDivElement>(null);

  const allTerms = useMemo(() => terms ?? [], [terms]);
  // As gavetas vêm de todos os termos, para o gaveteiro não mudar com a busca.
  const { drawers, drawerOf } = useMemo(() => buildDrawers(allTerms), [allTerms]);
  const matches = filterTerms(allTerms, progress, filters);
  const groups = groupByDrawer(drawers, drawerOf, matches);
  const rangeCounts = Object.fromEntries(drawers.map((d) => [d.id, groups[d.id].length])) as Record<DrawerId, number>;

  // Se a gaveta aberta ficou vazia com os filtros, mostra a primeira que tem resultado.
  const activeRange =
    selectedRange === null || rangeCounts[selectedRange] > 0 || matches.length === 0
      ? selectedRange
      : (drawers.find((d) => rangeCounts[d.id] > 0)?.id ?? selectedRange);

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

  const selectRange = (range: DrawerId | null) => {
    setSelectedRange(range);
    setOpenId(null);
    revealStackTop();
  };

  const changeFilters = (next: GlossaryFilters) => {
    setFilters(next);
    setOpenId(null);
  };
  const drawerLabel = drawers.find((d) => d.id === activeRange)?.label ?? null;

  return (
    // Três grupos (cabeçalho, controles, conteúdo): 48px entre eles, 8–12px dentro.
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-12 px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
      <GlossaryHeader
        seen={seenCount}
        total={allTerms.length}
        review={reviewCount}
        reviewActive={filters.onlyReview}
        onToggleReview={() => changeFilters({ ...filters, onlyReview: !filters.onlyReview })}
      />
      <GlossaryFiltersBar filters={filters} onChange={changeFilters} />

      {loading ? (
        <p className="label py-24 text-center text-tinta-suave">Abrindo arquivo…</p>
      ) : (
        <section ref={stackTopRef} aria-labelledby="titulo-secao" className="flex scroll-mt-4 flex-col gap-3">
          <div className="flex flex-col gap-2">
            <ArchivePath
              rangeLabel={drawerLabel}
              openTerm={openTerm}
              onGoToLetters={() => selectRange(null)}
              onGoToRange={() => setOpenId(null)}
            />
            <h2 id="titulo-secao" className="text-[20px] leading-tight font-semibold">
              {drawerLabel ? `Gaveta ${drawerLabel}` : "Gaveteiro"}
            </h2>
          </div>
          <FolderStack
            drawers={drawers}
            activeRange={activeRange}
            rangeCounts={rangeCounts}
            onSelectRange={selectRange}
            terms={stackTerms}
            total={allTerms.length}
            matchCount={matches.length}
            progress={progress}
            openId={openTerm?.id ?? null}
            onOpen={setOpenId}
            onUpdateProgress={updateProgress}
            overflow={overflow}
          />
        </section>
      )}
    </main>
  );
}
