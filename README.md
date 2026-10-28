# 🚀 Arquivos de UX — {reprograma} (Todas em Tech Futuro+ { IA Aplicada })

<p align="center">
  <b>Repositório dedicado ao projeto prático da semana 12 (Vibe Coding) do curso Todas em Tech Futuro+ { IA Aplicada }, da {reprograma}.</b>
</p>

<p align="center">
  <a href="https://arquivos-de-ux.vercel.app"><b>Acessar o site</b></a>
</p>

---

## 🎯 Sobre o Projeto

O Arquivos de UX é um glossário de Product Design feito para estudar por **recuperação ativa**: em vez de ler a definição primeiro, você escolhe um termo, tenta lembrar o significado e só então confere a ficha.

A interface imita um arquivo físico. A capa é um gaveteiro com as letras do alfabeto divididas em gavetas, e dentro de cada gaveta os termos ficam em pastas. A pasta escolhida sobe com a ficha completa (definição, exemplo e dica). Depois de ler, você marca se já sabia ou se quer revisar depois.

O desafio da semana foi tirar o projeto dos dados de exemplo e publicá-lo com banco de dados, área administrativa protegida por login e deploy contínuo.

### ✨ Funcionalidades

- **🗄️ Gaveteiro por letras:** 164 termos distribuídos em gavetas calculadas a partir dos dados (letras vizinhas se juntam; nenhuma letra é dividida).
- **🔍 Busca instantânea:** procura no nome, nos sinônimos (inglês, siglas, variações) e na definição.
- **🏷️ Filtros por categoria:** Pesquisa, Arquitetura da Informação, Interação, Prototipação, Estratégia, Times & Métodos e Design Visual.
- **📊 Progresso de estudo:** contador de termos vistos e de termos para revisar; o "Revisar N" vira um filtro com um clique. O progresso fica salvo no navegador.
- **🔐 Área administrativa:** em `/admin`, quem é admin pode buscar, criar, editar e apagar fichas. O glossário continua público.
- **♿ Acessibilidade:** contraste mínimo de 4,5:1 nos textos, navegação por teclado (Esc fecha a ficha e depois a gaveta) e respeito a `prefers-reduced-motion`.

---

## 🛠️ Tecnologias e Ferramentas Utilizadas

- **Linguagem:** TypeScript
- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router) com [React](https://react.dev/) 19
- **Estilo:** [Tailwind CSS](https://tailwindcss.com/) 4, com a paleta em variáveis CSS; pastas, abas e gavetas desenhadas em SVG
- **Banco de dados e login:** [Supabase](https://supabase.com/) (Postgres, Auth e Row Level Security)
- **Hospedagem:** [Vercel](https://vercel.com/), com deploy automático a cada push na branch `master`
- **IA:** [Claude Code](https://claude.com/claude-code) como par de programação, do código às consultas no banco
- **Controle de Versão:** Git e GitHub

---

## 🧠 O que Aprendi (Principais Aprendizados)

- **Recuperação ativa na interface:** a técnica de estudo virou regra de tela. A ficha só abre depois que eu escolho o termo, e os botões "Já sabia" e "Revisar depois" alimentam o progresso.
- **Proteção no banco:** com Row Level Security, qualquer pessoa lê as fichas, mas só quem está na tabela `admins` consegue escrever. Para conferir, tentei inserir um termo pela API com a chave pública e sem login. O banco recusou (HTTP 401). A página `/admin` não protege nada sozinha.
- **Troca de fonte dos dados:** os termos saíram de arquivos locais para uma tabela no Supabase. O progresso salvo no navegador usa um id gerado a partir do nome de cada termo, então mantive o mesmo id na migração para nenhum "visto" se perder.
- **O erro que mais demorou:** o site publicado abria sem nenhum termo. Havia dois projetos com o mesmo nome no Supabase e dois projetos ligados ao repositório na Vercel, e as variáveis de ambiente estavam no projeto errado. Nessa correção descobri que a Vercel não aceita variáveis `NEXT_PUBLIC_` do tipo "Secret", porque elas vão para o navegador de qualquer jeito. A chave publicável pode ficar exposta; quem barra a escrita é o RLS.
- **Manutenção do conteúdo:** com a área administrativa, dá para corrigir e acrescentar fichas sem mexer no código.

---

## 💻 Como Executar o Projeto

Passo a passo para rodar o código na sua máquina:

1. **Pré-requisito:** ter o [Node.js](https://nodejs.org/) instalado (versão 20 ou mais recente).

2. **Clone este repositório:**

   ```bash
   git clone https://github.com/alexsamoura/arquivos-de-ux.git
   cd arquivos-de-ux
   ```

3. **Instale as dependências:**

   ```bash
   npm install
   ```

4. **Configure o Supabase:** crie um arquivo `.env.local` na raiz do projeto com a URL e a chave publicável do seu projeto Supabase:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   O `.env.local` já está no `.gitignore` e não vai para o repositório.

5. **Prepare o banco** (só na primeira vez, num projeto Supabase novo): no SQL Editor do Supabase, crie a tabela `public.termos`, rode a migração em `supabase/migrations/` (tabela `admins`, função `is_admin()` e políticas de escrita) e depois o `supabase/seed.sql`, que insere os 164 termos.

6. **Rode o projeto:**

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000) no navegador.

7. **Área administrativa (opcional):** crie um usuário em **Authentication → Users** no Supabase, adicione o id dele à tabela `public.admins` e entre em [http://localhost:3000/login](http://localhost:3000/login).

---

## 📂 Estrutura do Projeto

```text
src/
├── app/                 # Rotas: / (glossário), /login e /admin
├── components/
│   ├── glossary/        # Gaveteiro, pilha de pastas, ficha e filtros
│   └── admin/           # Login e gestão das fichas
└── lib/
    ├── glossary/        # Tipos, busca, gavetas e leitura dos termos
    ├── admin/           # Autenticação e escrita das fichas
    └── supabase/        # Cliente do Supabase
supabase/
├── migrations/          # Estrutura do banco e políticas de acesso
└── seed.sql             # Os 164 termos
```
