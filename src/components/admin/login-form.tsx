"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "@/lib/admin/auth";
import { AdminShell, buttonClass, fieldClass } from "./admin-shell";

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Quem já está logado vai direto para a área restrita.
  useEffect(() => {
    if (session.status === "signed-in") router.replace("/admin");
  }, [session.status, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    const message = await signIn(email.trim(), password);
    setSending(false);
    if (message) {
      setError(message);
      return;
    }
    router.replace("/admin");
  }

  return (
    <AdminShell title="Acesso restrito ao arquivo">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-3" noValidate>
        <label className="flex flex-col gap-2 text-[15px]">
          E-mail
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[15px]">
          Senha
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
          />
        </label>
        {error ? (
          <p role="alert" className="text-[15px] text-carimbo">
            {error}
          </p>
        ) : null}
        <div className="pt-2">
          <button type="submit" className={buttonClass} disabled={sending || !email || !password}>
            {sending ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
