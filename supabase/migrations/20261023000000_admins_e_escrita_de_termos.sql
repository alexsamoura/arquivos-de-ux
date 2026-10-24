-- Fase 4: área /admin. Só quem está em public.admins pode escrever em termos.
-- A leitura pública dos termos continua como está.

-- Lista de administradores. RLS ativo e nenhuma política: o site não lê nem
-- escreve aqui; a checagem acontece só dentro de public.is_admin().
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;

-- Diz se o usuário da sessão é admin. Security definer para poder ler
-- public.admins apesar do RLS; search_path vazio e nomes qualificados para que
-- ninguém consiga trocar a tabela consultada.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Escrita em termos só para admins logados. Sem login (anon) não há política
-- de escrita, então o banco recusa.
create policy "Admins inserem termos"
  on public.termos for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins editam termos"
  on public.termos for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins apagam termos"
  on public.termos for delete
  to authenticated
  using ((select public.is_admin()));
