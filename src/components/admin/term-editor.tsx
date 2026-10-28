"use client";

import { useState, type FormEvent } from "react";
import type { AdminTerm, TermDraft } from "@/lib/admin/terms-admin";
import { CATEGORIES, type Category } from "@/lib/glossary/types";
import { buttonClass, fieldClass } from "./admin-shell";

interface TermEditorProps {
  /** Ficha a editar; sem ela, é uma ficha nova. */
  term: AdminTerm | null;
  onSave: (draft: TermDraft) => Promise<string | null>;
  onCancel: () => void;
}

/** Vazio vira null nos campos opcionais, para o banco guardar "sem valor", não texto vazio. */
const optional = (value: string) => (value.trim() ? value.trim() : null);

/** Formulário de ficha com todos os campos. Sinônimos: um por linha. */
export function TermEditor({ term, onSave, onCancel }: TermEditorProps) {
  const [termo, setTermo] = useState(term?.termo ?? "");
  const [sinonimos, setSinonimos] = useState((term?.sinonimos ?? []).join("\n"));
  const [categoria, setCategoria] = useState<Category>(term?.categoria ?? CATEGORIES[0]);
  const [definicao, setDefinicao] = useState(term?.definicao ?? "");
  const [exemplo, setExemplo] = useState(term?.exemplo ?? "");
  const [dica, setDica] = useState(term?.dica ?? "");
  const [fonte, setFonte] = useState(term?.fonte ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!termo.trim() || !definicao.trim()) {
      setError("Preencha o termo e a definição.");
      return;
    }
    setSaving(true);
    setError(null);
    const message = await onSave({
      termo: termo.trim(),
      sinonimos: sinonimos
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      categoria,
      definicao: definicao.trim(),
      exemplo: optional(exemplo),
      dica: optional(dica),
      fonte: optional(fonte),
    });
    setSaving(false);
    if (message) setError(message);
  }

  const labelClass = "flex flex-col gap-2 text-[15px]";

  return (
    <form
      onSubmit={submit}
      aria-label={term ? `Editar a ficha ${term.termo}` : "Nova ficha"}
      className="superficie flex flex-col gap-3 border-2 border-tinta bg-papel p-5"
      noValidate
    >
      <p className="label">{term ? `Editando: ${term.termo}` : "Nova ficha"}</p>
      <label className={labelClass}>
        Termo
        <input required value={termo} onChange={(e) => setTermo(e.target.value)} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Sinônimos <span className="label text-tinta-suave">Um por linha</span>
        <textarea rows={3} value={sinonimos} onChange={(e) => setSinonimos(e.target.value)} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Categoria
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Category)}
          className={`${fieldClass} cursor-pointer`}
        >
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Definição
        <textarea required rows={4} value={definicao} onChange={(e) => setDefinicao(e.target.value)} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Exemplo
        <textarea rows={3} value={exemplo} onChange={(e) => setExemplo(e.target.value)} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Dica
        <textarea rows={2} value={dica} onChange={(e) => setDica(e.target.value)} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Fonte <span className="label text-tinta-suave">Controle interno, não aparece no glossário</span>
        <input value={fonte} onChange={(e) => setFonte(e.target.value)} className={fieldClass} />
      </label>
      {error ? (
        <p role="alert" className="text-[15px] text-carimbo">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className={buttonClass} disabled={saving}>
          {saving ? "Salvando…" : "Salvar"}
        </button>
        <button type="button" className={buttonClass} onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
