/**
 * Id estável de um termo no app, derivado do nome. O progresso no localStorage é
 * guardado por esse id, então ele não pode mudar quando os termos passam a vir do
 * banco (onde o id é um uuid).
 */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Ids antigos que não batem com o slug do nome; mantidos para não perder progresso salvo. */
const LEGACY_TERM_IDS: Record<string, string> = {
  "Teste A/B": "teste-ab",
};

export function termIdFor(name: string) {
  return LEGACY_TERM_IDS[name] ?? slugify(name);
}
