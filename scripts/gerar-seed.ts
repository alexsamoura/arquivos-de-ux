/**
 * Gera supabase/seed.sql com todos os termos locais.
 *
 *   npx tsx scripts/gerar-seed.ts
 *
 * O INSERT usa ON CONFLICT (termo) DO NOTHING: rodar de novo não duplica nem
 * sobrescreve termos que já estão no banco.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { buildLocalTerms } from "../src/lib/glossary/local-terms";

/** Literal de texto do Postgres: aspas simples dobradas. */
const text = (value: string | null) => (value === null ? "null" : `'${value.replace(/'/g, "''")}'`);
const textArray = (values: string[]) => (values.length ? `array[${values.map(text).join(", ")}]::text[]` : "'{}'::text[]");

const terms = buildLocalTerms();
const rows = terms.map(
  (t) =>
    `  (${text(t.name)}, ${textArray(t.synonyms)}, ${text(t.category)}, ${text(t.definition)}, ${text(t.example)}, ${text(t.tip)}, ${text(t.source)})`,
);

const sql = `-- Gerado por scripts/gerar-seed.ts a partir dos termos locais do app.
-- ${terms.length} termos. Não edite à mão: rode o script de novo.
insert into public.termos (termo, sinonimos, categoria, definicao, exemplo, dica, fonte)
values
${rows.join(",\n")}
on conflict (termo) do nothing;
`;

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", sql);
console.log(`supabase/seed.sql: ${terms.length} termos`);
