import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura das telas de /login e /admin: mesmas cores, fontes e espaçamentos do glossário. */
export function AdminShell({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-12 px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
      <header className="flex flex-col gap-3 border-b-2 border-tinta pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2.5">
          <Link href="/" className="label text-tinta-suave underline-offset-4 hover:text-tinta hover:underline">
            Arquivos de UX
          </Link>
          <h1 className="text-[20px] leading-tight font-semibold">{title}</h1>
        </div>
        {aside}
      </header>
      {children}
    </main>
  );
}

/** Campo de texto no estilo da busca do glossário. */
export const fieldClass =
  "superficie w-full border-2 border-tinta bg-papel px-3 py-2.5 text-[15px] placeholder:text-tinta-suave focus:outline-none focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-tinta";

/** Botão com contorno, como "Já sabia" e "Revisar depois" na ficha. */
export const buttonClass =
  "label cursor-pointer border-2 border-tinta px-3 py-2.5 hover:bg-tinta hover:text-contra motion-safe:transition-transform motion-safe:duration-100 enabled:active:scale-[0.96] disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-tinta";
