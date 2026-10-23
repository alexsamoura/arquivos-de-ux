import { normalize } from "./filters";
import { MAX_FOLDERS_PER_STACK, type Drawer, type DrawerId, type Term } from "./types";

const letterOf = (term: Term) => normalize(term.name).charAt(0);

/**
 * Divide o arquivo em gavetas a partir dos termos (todos, sem filtro, para o
 * gaveteiro não mudar com a busca). Letras vizinhas dividem a gaveta enquanto
 * couberem `max` termos. Uma letra nunca é dividida: se sozinha passa de `max`
 * (como a P), ela ganha uma gaveta só dela, maior que as outras.
 *
 * `terms` precisa estar em ordem alfabética.
 */
export function buildDrawers(terms: Term[], max = MAX_FOLDERS_PER_STACK) {
  const byLetter: Term[][] = [];
  for (const term of terms) {
    const group = byLetter.at(-1);
    if (group && letterOf(group[0]) === letterOf(term)) group.push(term);
    else byLetter.push([term]);
  }

  const packed: Term[][] = [];
  for (const group of byLetter) {
    const current = packed.at(-1);
    if (current && current.length + group.length <= max) current.push(...group);
    else packed.push([...group]);
  }

  const drawerOf = new Map<string, DrawerId>();
  const drawers: Drawer[] = packed.map((drawerTerms) => {
    const from = letterOf(drawerTerms[0]);
    const to = letterOf(drawerTerms.at(-1)!);
    const label = from === to ? from.toUpperCase() : `${from.toUpperCase()}–${to.toUpperCase()}`;
    const id = normalize(label).replace(/[^a-z0-9]+/g, "-");
    for (const term of drawerTerms) drawerOf.set(term.id, id);
    return { id, label, from, to };
  });

  return { drawers, drawerOf };
}

/** Agrupa termos (já filtrados) pela gaveta de cada um. */
export function groupByDrawer(drawers: Drawer[], drawerOf: Map<string, DrawerId>, terms: Term[]) {
  const groups: Record<DrawerId, Term[]> = Object.fromEntries(drawers.map((d) => [d.id, [] as Term[]]));
  for (const term of terms) {
    const id = drawerOf.get(term.id);
    if (id) groups[id].push(term);
  }
  return groups;
}
