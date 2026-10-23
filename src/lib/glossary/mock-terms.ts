import type { Category } from "./types";

export interface TermSeed {
  id: string;
  name: string;
  definition: string;
  category: Category;
}

// Dados provisórios. Serão substituídos pela tabela de termos no Supabase.
export const MOCK_TERMS: TermSeed[] = [
  // A–C
  {
    id: "acessibilidade",
    name: "Acessibilidade",
    category: "Interação",
    definition:
      "Prática de projetar produtos que possam ser usados por qualquer pessoa, incluindo quem tem deficiências visuais, motoras, auditivas ou cognitivas. Segue diretrizes como a WCAG.",
  },
  {
    id: "affinity-diagram",
    name: "Affinity Diagram",
    category: "Pesquisa",
    definition:
      "Técnica de síntese em que anotações de pesquisa são agrupadas por semelhança até que temas e padrões apareçam. Também chamada de diagrama de afinidade.",
  },
  {
    id: "affordance",
    name: "Affordance",
    category: "Interação",
    definition:
      "Propriedade de um objeto que sugere como ele pode ser usado. Um botão com relevo parece clicável; uma alça sugere puxar.",
  },
  {
    id: "atomic-design",
    name: "Atomic Design",
    category: "Prototipação",
    definition:
      "Metodologia de Brad Frost que organiza interfaces em átomos, moléculas, organismos, templates e páginas, do componente mais simples ao mais complexo.",
  },
  {
    id: "benchmarking",
    name: "Benchmarking",
    category: "Estratégia",
    definition:
      "Análise sistemática de produtos concorrentes ou de referência para entender padrões, boas práticas e oportunidades de diferenciação.",
  },
  {
    id: "blueprint-de-servico",
    name: "Blueprint de Serviço",
    category: "Estratégia",
    definition:
      "Diagrama que mapeia a experiência do cliente junto com os processos de bastidor, pessoas e sistemas que a sustentam, camada por camada.",
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    category: "Arquitetura da Informação",
    definition:
      "Trilha de navegação que mostra onde a pessoa está na hierarquia do site, como Início › Categoria › Página, e permite voltar a níveis anteriores.",
  },
  {
    id: "call-to-action",
    name: "Call to Action",
    category: "Interação",
    definition:
      "Elemento, geralmente um botão ou link, que convida a pessoa a realizar a ação principal da tela, como assinar, comprar ou continuar.",
  },
  {
    id: "card-sorting",
    name: "Card Sorting",
    category: "Pesquisa",
    definition:
      "Método em que participantes organizam cartões com conteúdos em grupos que façam sentido para eles. Revela modelos mentais e orienta a arquitetura da informação.",
  },
  {
    id: "carga-cognitiva",
    name: "Carga Cognitiva",
    category: "Interação",
    definition:
      "Quantidade de esforço mental necessária para usar uma interface. Quanto menos a pessoa precisa lembrar, decidir ou interpretar, menor a carga.",
  },
  {
    id: "content-inventory",
    name: "Content Inventory",
    category: "Arquitetura da Informação",
    definition:
      "Levantamento completo de todo o conteúdo existente de um produto, com localização, tipo e responsável. Base para auditorias e reestruturações.",
  },
  {
    id: "customer-journey-map",
    name: "Customer Journey Map",
    category: "Estratégia",
    definition:
      "Representação visual das etapas que uma pessoa percorre ao interagir com um produto ou serviço, com ações, pensamentos, emoções e pontos de dor em cada fase.",
  },

  // D–L
  {
    id: "design-sprint",
    name: "Design Sprint",
    category: "Estratégia",
    definition:
      "Processo de cinco dias, criado no Google Ventures, para sair de um problema até um protótipo testado com usuários reais.",
  },
  {
    id: "design-system",
    name: "Design System",
    category: "Prototipação",
    definition:
      "Conjunto de componentes reutilizáveis, padrões, tokens e diretrizes que mantém a consistência visual e de comportamento de um produto.",
  },
  {
    id: "desk-research",
    name: "Desk Research",
    category: "Pesquisa",
    definition:
      "Pesquisa secundária feita a partir de fontes já existentes, como relatórios, artigos, dados públicos e estudos anteriores, sem contato direto com usuários.",
  },
  {
    id: "double-diamond",
    name: "Double Diamond",
    category: "Estratégia",
    definition:
      "Modelo de processo do Design Council com quatro fases: descobrir, definir, desenvolver e entregar. Alterna momentos de divergência e convergência.",
  },
  {
    id: "empty-state",
    name: "Empty State",
    category: "Interação",
    definition:
      "Tela ou área exibida quando ainda não há conteúdo, como uma lista vazia. Bem projetado, explica o motivo e indica o próximo passo.",
  },
  {
    id: "feedback",
    name: "Feedback",
    category: "Interação",
    definition:
      "Resposta do sistema a uma ação da pessoa, visual, sonora ou tátil, que confirma o que aconteceu, como um botão que muda de estado ao ser pressionado.",
  },
  {
    id: "fluxo-de-usuario",
    name: "Fluxo de Usuário",
    category: "Arquitetura da Informação",
    definition:
      "Diagrama que mostra o caminho passo a passo que uma pessoa percorre para completar uma tarefa, incluindo telas, decisões e desvios.",
  },
  {
    id: "guerrilla-testing",
    name: "Guerrilla Testing",
    category: "Pesquisa",
    definition:
      "Teste de usabilidade rápido e informal, feito com pessoas abordadas em locais públicos, para obter sinais iniciais com baixo custo.",
  },
  {
    id: "heuristicas-de-nielsen",
    name: "Heurísticas de Nielsen",
    category: "Pesquisa",
    definition:
      "Dez princípios gerais de usabilidade definidos por Jakob Nielsen, como visibilidade do status do sistema e prevenção de erros. Usados em avaliações heurísticas.",
  },
  {
    id: "jobs-to-be-done",
    name: "Jobs to Be Done",
    category: "Estratégia",
    definition:
      "Abordagem que entende produtos como algo que as pessoas contratam para realizar um trabalho ou progresso na vida, em vez de focar em perfis demográficos.",
  },
  {
    id: "lei-de-fitts",
    name: "Lei de Fitts",
    category: "Interação",
    definition:
      "Princípio que diz que o tempo para alcançar um alvo depende da distância até ele e do seu tamanho. Alvos grandes e próximos são mais rápidos de acertar.",
  },
  {
    id: "lei-de-hick",
    name: "Lei de Hick",
    category: "Interação",
    definition:
      "Princípio que diz que o tempo de decisão aumenta com o número e a complexidade das opções. Menos escolhas por vez tornam a decisão mais rápida.",
  },
  {
    id: "lo-fi",
    name: "Lo-fi",
    category: "Prototipação",
    definition:
      "Protótipo de baixa fidelidade, como esboços em papel ou wireframes simples, usado para testar ideias cedo e barato, sem detalhes visuais.",
  },

  // M–R
  {
    id: "mapa-de-empatia",
    name: "Mapa de Empatia",
    category: "Pesquisa",
    definition:
      "Ferramenta que organiza o que uma pessoa diz, pensa, faz e sente, para criar um entendimento compartilhado sobre suas necessidades.",
  },
  {
    id: "microinteracao",
    name: "Microinteração",
    category: "Interação",
    definition:
      "Pequeno momento de interação com um único propósito, como curtir uma publicação ou ligar um interruptor, composto de gatilho, regras, feedback e ciclos.",
  },
  {
    id: "mockup",
    name: "Mockup",
    category: "Prototipação",
    definition:
      "Representação estática de alta fidelidade visual de uma tela, com cores, tipografia e imagens finais, mas sem interação.",
  },
  {
    id: "modelo-mental",
    name: "Modelo Mental",
    category: "Interação",
    definition:
      "Crença que a pessoa tem sobre como um sistema funciona, formada por experiências anteriores. Interfaces que respeitam esse modelo parecem intuitivas.",
  },
  {
    id: "mvp",
    name: "MVP",
    category: "Estratégia",
    definition:
      "Minimum Viable Product: a versão mais simples de um produto capaz de entregar valor e gerar aprendizado validado com usuários reais.",
  },
  {
    id: "north-star-metric",
    name: "North Star Metric",
    category: "Estratégia",
    definition:
      "Métrica única que melhor representa o valor que o produto entrega aos clientes e orienta as decisões de todo o time.",
  },
  {
    id: "onboarding",
    name: "Onboarding",
    category: "Interação",
    definition:
      "Experiência inicial que ajuda uma pessoa nova a entender o produto e chegar rapidamente ao primeiro momento de valor.",
  },
  {
    id: "persona",
    name: "Persona",
    category: "Pesquisa",
    definition:
      "Personagem fictício baseado em dados de pesquisa que representa um grupo de usuários, com objetivos, comportamentos e frustrações.",
  },
  {
    id: "progressive-disclosure",
    name: "Progressive Disclosure",
    category: "Interação",
    definition:
      "Técnica que mostra primeiro só o essencial e revela opções avançadas sob demanda, reduzindo a complexidade percebida.",
  },
  {
    id: "proposta-de-valor",
    name: "Proposta de Valor",
    category: "Estratégia",
    definition:
      "Declaração clara do benefício que o produto entrega, para quem e por que é melhor que as alternativas.",
  },
  {
    id: "prototipo-navegavel",
    name: "Protótipo Navegável",
    category: "Prototipação",
    definition:
      "Protótipo com telas conectadas por interações clicáveis, que simula o uso real do produto para testes e apresentações.",
  },
  {
    id: "roadmap",
    name: "Roadmap",
    category: "Estratégia",
    definition:
      "Plano visual que comunica a direção do produto ao longo do tempo, com temas, objetivos e prioridades, sem prometer datas exatas de cada entrega.",
  },

  // S–Z
  {
    id: "sitemap",
    name: "Sitemap",
    category: "Arquitetura da Informação",
    definition:
      "Diagrama hierárquico com todas as páginas de um site ou app e as relações entre elas.",
  },
  {
    id: "stakeholder",
    name: "Stakeholder",
    category: "Estratégia",
    definition:
      "Qualquer pessoa ou grupo com interesse ou influência no projeto, como líderes, times internos, clientes ou parceiros.",
  },
  {
    id: "storyboard",
    name: "Storyboard",
    category: "Prototipação",
    definition:
      "Sequência de quadros ilustrados que conta como uma pessoa usa o produto num contexto real, do problema à solução.",
  },
  {
    id: "sus",
    name: "SUS",
    category: "Pesquisa",
    definition:
      "System Usability Scale: questionário de dez afirmações que gera uma pontuação de 0 a 100 para a usabilidade percebida de um sistema.",
  },
  {
    id: "taxonomia",
    name: "Taxonomia",
    category: "Arquitetura da Informação",
    definition:
      "Sistema de classificação que organiza conteúdos em categorias e subcategorias com nomes consistentes.",
  },
  {
    id: "teste-ab",
    name: "Teste A/B",
    category: "Pesquisa",
    definition:
      "Experimento que compara duas versões de uma tela ou elemento com grupos diferentes de usuários para ver qual tem melhor desempenho numa métrica.",
  },
  {
    id: "teste-de-usabilidade",
    name: "Teste de Usabilidade",
    category: "Pesquisa",
    definition:
      "Sessão em que pessoas reais tentam realizar tarefas num produto enquanto são observadas, para encontrar problemas de uso.",
  },
  {
    id: "think-aloud",
    name: "Think Aloud",
    category: "Pesquisa",
    definition:
      "Protocolo em que a pessoa participante verbaliza o que pensa enquanto usa o produto, revelando expectativas e confusões.",
  },
  {
    id: "tree-testing",
    name: "Tree Testing",
    category: "Arquitetura da Informação",
    definition:
      "Teste que avalia se as pessoas encontram itens numa estrutura de navegação em texto puro, sem layout visual. Valida a hierarquia.",
  },
  {
    id: "wayfinding",
    name: "Wayfinding",
    category: "Arquitetura da Informação",
    definition:
      "Conjunto de pistas que ajudam a pessoa a saber onde está, para onde pode ir e como voltar dentro de um produto.",
  },
  {
    id: "wireframe",
    name: "Wireframe",
    category: "Prototipação",
    definition:
      "Esqueleto de uma tela que define estrutura, hierarquia e posição dos elementos, sem acabamento visual.",
  },
];
