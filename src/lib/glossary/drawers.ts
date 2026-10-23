import { normalize } from "./filters";
import { MAX_FOLDERS_PER_STACK, type Drawer, type DrawerId, type Term } from "./types";

interface Segment {
  terms: Term[];
  /** Pedaço de uma letra grande demais para uma gaveta só. */
  split: boolean;
}

const letterOf = (term: Term) => normalize(term.name).charAt(0);

/** Etiqueta de um pedaço de letra: menor prefixo que distingue o primeiro do último termo ("Pa–Pe"). */
function splitLabel(first: Term, last: Term) {
  const a = normalize(first.name).replace(/[^a-z0-9]/g, "");
  const b = normalize(last.name).replace(/[^a-z0-9]/g, "");
  let length = 2;
  while (length < 6 && a.slice(0, length) === b.slice(0, length)) length++;
  const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  return `${cap(a.slice(0, length))}–${cap(b.slice(0, length))}`;
}

/**
 * Divide o arquivo em gavetas a partir dos termos (todos, sem filtro, para o
 * gaveteiro não mudar com a busca). Letras vizinhas dividem a gaveta enquanto
 * couberem `max` termos; uma letra que sozinha passa disso é dividida em
 * pedaços do mesmo tamanho, cada um na sua gaveta.
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

  const segments = byLetter.flatMap((group): Segment[] => {
    if (group.length <= max) return [{ terms: group, split: false }];
    const parts = Math.ceil(group.length / max);
    const size = Math.ceil(group.length / parts);
    return Array.from({ length: parts }, (_, i) => ({ terms: group.slice(i * size, (i + 1) * size), split: true }));
  });

  const packed: Segment[] = [];
  for (const segment of segments) {
    const current = packed.at(-1);
    if (current && !current.split && !segment.split && current.terms.length + segment.terms.length <= max) {
      current.terms.push(...segment.terms);
    } else {
      packed.push({ terms: [...segment.terms], split: segment.split });
    }
  }

  const drawerOf = new Map<string, DrawerId>();
  const drawers: Drawer[] = packed.map((segment) => {
    const first = segment.terms[0];
    const last = segment.terms.at(-1)!;
    const from = letterOf(first);
    const to = letterOf(last);
    const label = segment.split ? splitLabel(first, last) : from === to ? from.toUpperCase() : `${from.toUpperCase()}–${to.toUpperCase()}`;
    const id = normalize(label).replace(/[^a-z0-9]+/g, "-");
    for (const term of segment.terms) drawerOf.set(term.id, id);
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
