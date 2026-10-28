"use client";

import { useMemo, useRef, useState } from "react";
import { buildDrawers, groupByDrawer } from "@/lib/glossary/drawers";
import { filterTerms, type GlossaryFilters } from "@/lib/glossary/filters";
import type { DrawerId } from "@/lib/glossary/types";
import { useGlossary } from "@/lib/glossary/use-glossary";
import { ArchivePath } from "./archive-path";
import { FolderStack } from "./folder-stack";
import { GlossaryFiltersBar } from "./glossary-filters";
import { GlossaryHeader } from "./glossary-header";

const INITIAL_FILTERS: GlossaryFilters = { query: "", category: null, onlyReview: false };

export function GlossaryApp() {
  const { terms, progress, updateProgress, status, error, retry } = useGlossary();
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
  const openTerm = rangeTerms.find((t) => t.id === openId) ?? null;

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
        ready={status === "ready"}
        seen={seenCount}
        total={allTerms.length}
        review={reviewCount}
        reviewActive={filters.onlyReview}
        onToggleReview={() => changeFilters({ ...filters, onlyReview: !filters.onlyReview })}
      />
      <GlossaryFiltersBar filters={filters} onChange={changeFilters} />

      {status === "loading" ? (
        <p role="status" className="label py-24 text-center text-tinta-suave">
          Abrindo arquivo…
        </p>
      ) : status === "error" ? (
        <ArchiveMessage
          title="Não foi possível abrir o arquivo"
          detail={error ?? "Erro desconhecido ao buscar os termos."}
          action={{ label: "Tentar de novo", onClick: retry }}
          role="alert"
        />
      ) : allTerms.length === 0 ? (
        <ArchiveMessage title="O arquivo está vazio" detail="Ainda não há termos cadastrados." role="status" />
      ) : (
        <section
          ref={stackTopRef}
          aria-label={drawerLabel ? `Gaveta ${drawerLabel}` : "Gaveteiro"}
          className="flex scroll-mt-4 flex-col gap-3"
        >
          {/* Na capa não há título visível: o gaveteiro fala por si. Dentro de uma
              gaveta, o caminho diz onde se está e leva de volta. */}
          {drawerLabel ? (
            <ArchivePath
              rangeLabel={drawerLabel}
              openTerm={openTerm}
              onGoToLetters={() => selectRange(null)}
              onGoToRange={() => setOpenId(null)}
            />
          ) : (
            <h2 className="sr-only">Gaveteiro</h2>
          )}
          <FolderStack
            drawers={drawers}
            activeRange={activeRange}
            rangeCounts={rangeCounts}
            onSelectRange={selectRange}
            terms={rangeTerms}
            total={allTerms.length}
            matchCount={matches.length}
            progress={progress}
            openId={openTerm?.id ?? null}
            onOpen={setOpenId}
            onUpdateProgress={updateProgress}
          />
        </section>
      )}
    </main>
  );
}

/** Aviso no lugar do gaveteiro: título em metadado, detalhe e, se houver, uma ação. */
function ArchiveMessage({
  title,
  detail,
  action,
  role,
}: {
  title: string;
  detail: string;
  action?: { label: string; onClick: () => void };
  role: "alert" | "status";
}) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="label">{title}</p>
      <p className="text-[15px] leading-snug text-tinta-suave">{detail}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="cursor-pointer text-[15px] underline underline-offset-4 hover:text-tinta-suave"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
