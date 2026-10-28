"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkIsAdmin, signOut, useSession } from "@/lib/admin/auth";
import {
  createTerm,
  deleteTerm,
  listAdminTerms,
  updateTerm,
  type AdminTerm,
  type TermDraft,
} from "@/lib/admin/terms-admin";
import { normalize } from "@/lib/glossary/filters";
import { AdminShell, buttonClass } from "./admin-shell";
import { TermEditor } from "./term-editor";

type Access = "checking" | "admin" | "denied" | "error";

/**
 * Área /admin. A tela só some para quem não é admin; quem garante de fato que
 * ninguém mais escreve é o RLS do banco (políticas com public.is_admin()).
 */
export function AdminApp() {
  const router = useRouter();
  const session = useSession();
  const [access, setAccess] = useState<Access>("checking");

  // Sem sessão: vai para o login.
  useEffect(() => {
    if (session.status === "signed-out") router.replace("/login");
  }, [session.status, router]);

  const userId = session.status === "signed-in" ? session.session.user.id : null;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    checkIsAdmin().then(
      (isAdmin) => active && setAccess(isAdmin ? "admin" : "denied"),
      () => active && setAccess("error"),
    );
    return () => {
      active = false;
    };
  }, [userId]);

  const exit = async () => {
    await signOut();
    router.replace("/login");
  };

  if (session.status !== "signed-in" || access === "checking") {
    return (
      <AdminShell title="Administração do arquivo">
        <p role="status" className="label py-24 text-center text-tinta-suave">
          Verificando acesso…
        </p>
      </AdminShell>
    );
  }

  const aside = (
    <div className="flex items-center gap-4">
      <span className="label text-tinta-suave">{session.session.user.email}</span>
      <button type="button" onClick={exit} className={buttonClass}>
        Sair
      </button>
    </div>
  );

  if (access !== "admin") {
    return (
      <AdminShell title="Administração do arquivo" aside={aside}>
        <p role="alert" className="py-24 text-center text-[15px]">
          {access === "denied"
            ? "Você não tem acesso a esta área."
            : "Não foi possível verificar o seu acesso. Recarregue a página."}
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Administração do arquivo" aside={aside}>
      <TermManager />
    </AdminShell>
  );
}

/** Lista com busca, criação, edição e exclusão de fichas. */
function TermManager() {
  const [terms, setTerms] = useState<AdminTerm[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // null = nenhuma ficha aberta; "nova" = criando; senão, o id da ficha em edição.
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    let active = true;
    listAdminTerms().then(
      (loaded) => active && setTerms(loaded),
      (reason: unknown) => active && setLoadError(reason instanceof Error ? reason.message : String(reason)),
    );
    return () => {
      active = false;
    };
  }, [reloads]);

  const reload = (message: string) => {
    setNotice(message);
    setReloads((n) => n + 1);
  };

  const save = async (draft: TermDraft) => {
    const message = editing === "nova" ? await createTerm(draft) : await updateTerm(editing!, draft);
    if (!message) {
      setEditing(null);
      reload(editing === "nova" ? `Ficha "${draft.termo}" criada.` : `Ficha "${draft.termo}" salva.`);
    }
    return message;
  };

  const remove = async (term: AdminTerm) => {
    if (!window.confirm(`Apagar a ficha '${term.termo}'? Essa ação não tem volta.`)) return;
    const message = await deleteTerm(term.id);
    if (message) setNotice(message);
    else {
      if (editing === term.id) setEditing(null);
      reload(`Ficha "${term.termo}" apagada.`);
    }
  };

  if (loadError) {
    return (
      <p role="alert" className="py-24 text-center text-[15px]">
        Não foi possível carregar as fichas: {loadError}
      </p>
    );
  }
  if (!terms) {
    return (
      <p role="status" className="label py-24 text-center text-tinta-suave">
        Abrindo arquivo…
      </p>
    );
  }

  const q = normalize(query);
  const visible = q
    ? terms.filter((t) => normalize(t.termo).includes(q) || t.sinonimos.some((s) => normalize(s).includes(q)))
    : terms;
  const editingTerm = editing && editing !== "nova" ? (terms.find((t) => t.id === editing) ?? null) : null;

  return (
    <div className="flex flex-col gap-12">
      <section aria-label="Busca e nova ficha" className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="superficie flex flex-1 items-center gap-3 border-2 border-tinta bg-papel px-3">
            <span className="shrink-0 text-[15px]">Buscar</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="termo ou sinônimo"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] placeholder:text-tinta-suave focus:outline-none"
            />
          </label>
          <button type="button" className={buttonClass} onClick={() => setEditing("nova")}>
            Nova ficha
          </button>
        </div>
        {notice ? (
          <p role="status" className="text-[15px] text-tinta-suave">
            {notice}
          </p>
        ) : null}
      </section>

      {editing ? (
        <TermEditor
          key={editing}
          term={editingTerm}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section aria-label="Fichas" className="flex flex-col gap-3">
        <p className="label text-tinta-suave">
          {visible.length} de {terms.length} fichas
        </p>
        <ul className="flex flex-col border-t-2 border-tinta">
          {visible.map((term) => (
            <li key={term.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-2 border-tinta py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[15px]">{term.termo}</span>
                <span className="label text-tinta-suave">{term.categoria}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" className={buttonClass} onClick={() => setEditing(term.id)}>
                  Editar
                </button>
                <button type="button" className={buttonClass} onClick={() => remove(term)}>
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
        {visible.length === 0 ? <p className="text-[15px] text-tinta-suave">Nenhuma ficha encontrada.</p> : null}
      </section>
    </div>
  );
}
