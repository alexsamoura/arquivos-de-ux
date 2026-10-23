# Arquivo de UX — termos novos: instruções de integração

Arquivo de dados: `termos-novos.json` (125 termos, com definição, exemplo e dica em português).

Fontes dos NOMES dos termos (as definições foram escritas do zero, não copiadas):
- Gabriel Silvestri, "64 Jargões de UX e tecnologia" (2018) — marcado como "Silvestri"
- Glossário do Google UX Design Certificate (231 verbetes) — marcado como "Google"

Regra de nomes: mantido em inglês quando é assim que o mercado brasileiro usa (Edge case, Happy path, Scope creep, Wireframe, Lorem ipsum, Cards, Insight, KPI, Backlog, Sprint...). Traduzido quando há termo consolidado em português (Viés de confirmação, Leitor de tela, Pesquisa qualitativa, Tipografia, Carrossel...). O nome no outro idioma está sempre em `sinonimos`, para a busca encontrar os dois.

## Campos

termo, sinonimos (lista), categoria, definicao, exemplo, dica, fonte.
O campo `fonte` é só para controle interno; não precisa aparecer na interface.

## Categorias

As 5 atuais + 2 novas:
- Times & Métodos — ágil, papéis e rituais (26 termos)
- Design Visual — Gestalt, tipografia, grid, hierarquia (15 termos)

## Sinônimos para termos que JÁ EXISTEM no app (não criar de novo)

| Termo no app | Adicionar em `sinonimos` |
|---|---|
| Benchmarking | Benchmark, Competitive audit, Auditoria competitiva |
| Affinity Diagram | Diagrama de afinidade |
| Customer Journey Map | Jornada do usuário, User journey |
| MVP | Produto Mínimo Viável, Minimum Viable Product |
| Mapa de Empatia | Empathy map, Aggregated empathy map, Mapa da empatia |
| Persona | Avatar |
| Desk Research | Pesquisa secundária, Secondary research |
| Proposta de Valor | Value proposition |
| Modelo Mental | Mental model, Mental models |
| Acessibilidade | Accessibility |
| Call to Action | CTA, Call-to-action |
| Design System | — |
| Design Sprint | Sprint brief |
| Card Sorting | — |
| Mockup | — |

Atenção: pode haver outros duplicados nos termos do app que não apareceram nos prints (D–L e S–Z). Candidatos a conferir: Wireframe, Design thinking, Hierarquia visual, Gestalt, Usabilidade, Teste de usabilidade, User flow, Sitemap, Storyboard, Iteração. Se já existirem, mantenha a versão do app e junte os sinônimos.

## Excluídos do glossário do Google (e por quê)

- Carreira e mercado, não vocabulário de UX: Advertising agencies, Apprenticeships, Corporation, Design agency, Entry-level job, Internship, Startup, Generalist, Specialist, Graphic designers, Production designers, Motion designers, Visual designer, UX program managers, Personal brand, Portfolio.
- Gestão comercial: Budget estimate, Payment schedule, Proposal, Scope of work, Statement of Work, Project background, NDA.
- Genéricos demais: Affinity, Context, Domain, Dopamine, Elements, Framework, Methodology, Platform, Presentation, Presenter, Key terms, Equality, Scalable, Test, The human factor.
- Variações de layout muito específicas: Asymmetrical, Box, Multi-column, Single column, Tiered layer cake, Featured image, Grid of cards (ficaram só Padrão F, Padrão Z e Grid).
- Detalhes de design visual cobertos por termos mais amplos: Borders, Dividers, Containment, Shadows, Fill, Emphasis, Proportion, Scale, Unity, Variety, Focal point, Motion, Gesture, Interactivity.
- Logística de pesquisa: Notetaker, Facilitator, Spreadsheet note-taking, Second round of interviews, Research report, Research study, Peer reviews, Foundational research, Post-launch research, User group.
- Específicos de um contexto: Next Billion Users (Google), WebAIM, Landmarks, Initial focus, Dedicated mobile app, Responsive web app, Use of navigation vs. search, Vulnerable populations, Equity-focused design, Friendliness bias.
- Acessibilidade em detalhe (cobertos por Tecnologia assistiva): Switch device, Speech to text, Voice control, Customizable text, Color modification.
- Dados sensíveis (tema jurídico, não de UX): PII, Sensitive PII.
- Erro de digitação no original: "Reviewier".

Se quiser recuperar algum, basta pedir que eu escrevo a ficha no mesmo padrão.
