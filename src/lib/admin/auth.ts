"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

/** Mensagem única para qualquer falha de credencial: não diz se o erro foi no e-mail ou na senha. */
const INVALID_CREDENTIALS = "E-mail ou senha incorretos";
const LOGIN_UNAVAILABLE = "Não foi possível entrar agora. Tente de novo em instantes.";

/** Entra com e-mail e senha. Devolve `null` se deu certo, ou a mensagem para mostrar. */
export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (!error) return null;
  // 400 = credenciais recusadas (inclui e-mail inexistente). Qualquer outra coisa é
  // falha de rede ou do serviço; nenhuma das duas revela qual campo está errado.
  return error.status === 400 ? INVALID_CREDENTIALS : LOGIN_UNAVAILABLE;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

/** Pergunta ao banco se o usuário da sessão está em public.admins (função is_admin). */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await getSupabase().rpc("is_admin");
  if (error) throw new Error(error.message);
  return data === true;
}

export type SessionState = { status: "checking" } | { status: "signed-out" } | { status: "signed-in"; session: Session };

/** Sessão atual, atualizada quando a pessoa entra ou sai (inclusive em outra aba). */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "checking" });

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState(data.session ? { status: "signed-in", session: data.session } : { status: "signed-out" });
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? { status: "signed-in", session } : { status: "signed-out" });
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
