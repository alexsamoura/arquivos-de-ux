// Exemplo e dica de cada termo mock, por id. No Supabase serão colunas da tabela de termos.
export interface TermDetails {
  example: string;
  tip: string;
}

export const MOCK_TERM_DETAILS: Record<string, TermDetails> = {
  acessibilidade: {
    example: "Garantir contraste mínimo de 4.5:1 e que todo o fluxo de compra funcione só com o teclado.",
    tip: "Pense em quem usa leitor de tela, teclado ou está com o braço engessado: acessível é usável por todos.",
  },
  "affinity-diagram": {
    example: "Depois de oito entrevistas, o time cola post-its na parede e forma grupos como \"medo de errar o pagamento\".",
    tip: "Afinidade = juntar o que se parece até os temas falarem por si.",
  },
  affordance: {
    example: "Uma maçaneta de alavanca convida a empurrar para baixo; um link sublinhado convida ao clique.",
    tip: "Do inglês \"to afford\": o que o objeto oferece fazer.",
  },
  "atomic-design": {
    example: "Um botão (átomo) + campo (átomo) formam a busca (molécula), que entra no cabeçalho (organismo).",
    tip: "Química aplicada à UI: do átomo à página.",
  },
  benchmarking: {
    example: "Antes de redesenhar o checkout, o time compara o fluxo de cinco e-commerces líderes.",
    tip: "Bench = bancada de comparação: você mede o seu ao lado dos outros.",
  },
  "blueprint-de-servico": {
    example: "Num hotel, mapear do check-in na recepção até o sistema de reservas e a equipe de limpeza.",
    tip: "É a planta do serviço: palco (o que o cliente vê) e bastidores.",
  },
  breadcrumb: {
    example: "Loja › Calçados › Tênis › Corrida, no topo de uma página de produto.",
    tip: "As migalhas de pão de João e Maria: o caminho para voltar.",
  },
  "call-to-action": {
    example: "O botão \"Começar teste grátis\" em destaque na página inicial de um SaaS.",
    tip: "CTA = o convite principal da tela. Se houver três, nenhum é principal.",
  },
  "card-sorting": {
    example: "Participantes agrupam 40 cartões de serviços bancários; o grupo \"meu dinheiro\" vira um item de menu.",
    tip: "Aberto: as pessoas criam as categorias. Fechado: elas usam as suas.",
  },
  "carga-cognitiva": {
    example: "Um formulário que pede o CEP e já preenche o endereço reduz o que a pessoa precisa lembrar.",
    tip: "Cada decisão e cada coisa para memorizar pesa na mochila mental.",
  },
  "content-inventory": {
    example: "Uma planilha com as 300 páginas do site, a URL, o dono e a data da última atualização.",
    tip: "Inventário vem antes da auditoria: primeiro conte, depois avalie.",
  },
  "customer-journey-map": {
    example: "Mapear a jornada de quem aluga um apartamento: busca, visita, contrato, mudança e primeiro mês.",
    tip: "Linha do tempo + emoções: onde a curva cai é a oportunidade.",
  },
  "design-sprint": {
    example: "Segunda: mapear o problema. Sexta: testar o protótipo com cinco clientes.",
    tip: "Cinco dias: entender, esboçar, decidir, prototipar, testar.",
  },
  "design-system": {
    example: "O Material Design, do Google, com componentes, tokens de cor e regras de uso documentadas.",
    tip: "Mais que uma biblioteca de componentes: inclui o porquê de cada decisão.",
  },
  "desk-research": {
    example: "Ler relatórios de mercado e estudos acadêmicos antes de marcar a primeira entrevista.",
    tip: "Feita da mesa (desk): ninguém novo é entrevistado.",
  },
  "double-diamond": {
    example: "Primeiro diamante: descobrir que o problema real é a confiança. Segundo: testar soluções para ela.",
    tip: "Dois diamantes = abrir e fechar duas vezes: problema certo, depois solução certa.",
  },
  "empty-state": {
    example: "\"Você ainda não tem projetos. Crie o primeiro\" com um botão, no lugar de uma lista em branco.",
    tip: "Vazio não é erro: é a chance de ensinar o próximo passo.",
  },
  feedback: {
    example: "O botão \"Enviar\" vira \"Enviando…\" e depois mostra \"Mensagem enviada\".",
    tip: "Toda ação merece uma resposta visível do sistema.",
  },
  "fluxo-de-usuario": {
    example: "Do e-mail de recuperação até a nova senha salva, com o desvio de link expirado.",
    tip: "Fluxo é sobre o caminho e as decisões, não sobre o visual das telas.",
  },
  "guerrilla-testing": {
    example: "Pedir a clientes de um café que tentem achar o horário de funcionamento num protótipo.",
    tip: "Guerrilha = rápido, barato e onde as pessoas estão.",
  },
  "heuristicas-de-nielsen": {
    example: "Avaliar um app e notar que ele não mostra progresso durante o upload (visibilidade do status).",
    tip: "São dez. Comece pelas mais lembradas: status do sistema, controle do usuário, prevenção de erros.",
  },
  "jobs-to-be-done": {
    example: "As pessoas não compram uma furadeira; elas contratam um furo na parede para pendurar um quadro.",
    tip: "Pergunte: que progresso a pessoa quer fazer quando \"contrata\" o produto?",
  },
  "lei-de-fitts": {
    example: "Botões principais grandes e perto do polegar no celular; menus nas bordas da tela no desktop.",
    tip: "Grande e perto = rápido. Pequeno e longe = lento.",
  },
  "lei-de-hick": {
    example: "Um menu de restaurante com 80 pratos atrasa a escolha; dividir em seções acelera.",
    tip: "Mais opções, mais tempo para decidir.",
  },
  "lo-fi": {
    example: "Esboços em papel de três layouts de tela inicial, testados antes de abrir o Figma.",
    tip: "Low fidelity: feio de propósito, para as pessoas criticarem a ideia e não a cor.",
  },
  "mapa-de-empatia": {
    example: "Um quadro com quatro áreas preenchido pelo time após entrevistar motoristas de aplicativo.",
    tip: "Diz, pensa, faz, sente.",
  },
  microinteracao: {
    example: "O coração que pulsa ao curtir uma foto, ou o interruptor que desliza ao ativar o modo escuro.",
    tip: "Gatilho, regras, feedback, ciclos e modos.",
  },
  mockup: {
    example: "A tela final do app em alta fidelidade, mostrada ao cliente para aprovação visual.",
    tip: "Mockup mostra como fica; protótipo mostra como funciona.",
  },
  "modelo-mental": {
    example: "Muita gente espera que o ícone de lixeira apague; se ele arquivar, quebra o modelo mental.",
    tip: "É o que a pessoa acha que vai acontecer, não o que de fato acontece.",
  },
  mvp: {
    example: "Antes de criar o app, testar a demanda com uma página de inscrição e entregas feitas à mão.",
    tip: "Mínimo para aprender, não mínimo para lançar.",
  },
  "north-star-metric": {
    example: "No Spotify, o tempo de escuta; no Airbnb, as noites reservadas.",
    tip: "Uma estrela que todos os times conseguem ver e seguir.",
  },
  onboarding: {
    example: "No primeiro acesso, o app de finanças pede só para conectar uma conta e já mostra o saldo.",
    tip: "O objetivo é o primeiro momento de valor, não um tour por todas as telas.",
  },
  persona: {
    example: "\"Carla, 34, enfermeira, faz compras no celular nos intervalos do plantão.\"",
    tip: "Sem dados de pesquisa por trás, é só um estereótipo com foto.",
  },
  "progressive-disclosure": {
    example: "Um campo \"Opções avançadas\" que só abre os filtros extras quando a pessoa clica.",
    tip: "Primeiro o essencial; o resto sob demanda.",
  },
  "proposta-de-valor": {
    example: "\"Envie dinheiro para o exterior em minutos, com a taxa real do câmbio.\"",
    tip: "Para quem, qual benefício e por que você em vez da alternativa.",
  },
  "prototipo-navegavel": {
    example: "Telas do Figma ligadas por cliques, usadas num teste de usabilidade remoto.",
    tip: "Navegável = dá para clicar e seguir de uma tela para outra.",
  },
  roadmap: {
    example: "Agora: checkout. Próximo: assinaturas. Depois: marketplace.",
    tip: "Comunica direção e prioridades, não um cronograma de entregas.",
  },
  sitemap: {
    example: "Uma árvore com Início no topo e, abaixo, Produtos, Sobre, Blog e Contato.",
    tip: "Mapa do site: todas as páginas e como se ligam.",
  },
  stakeholder: {
    example: "O time jurídico precisa aprovar o novo fluxo de cadastro antes do lançamento.",
    tip: "Quem tem algo em jogo (stake) no resultado.",
  },
  storyboard: {
    example: "Seis quadros: a pessoa perde o ônibus, abre o app, vê o próximo horário e chega a tempo.",
    tip: "Como uma história em quadrinhos: contexto antes da interface.",
  },
  sus: {
    example: "Ao fim de um teste, cada participante responde às dez afirmações; a média dá 72.",
    tip: "Acima de 68 é considerado acima da média.",
  },
  taxonomia: {
    example: "Num e-commerce de moda: Feminino › Roupas › Vestidos › Midi.",
    tip: "Taxonomia nomeia e classifica; navegação é como se chega lá.",
  },
  "teste-ab": {
    example: "Metade dos visitantes vê o botão \"Comprar agora\" e metade vê \"Adicionar ao carrinho\".",
    tip: "Mude uma coisa por vez, ou você não sabe o que causou a diferença.",
  },
  "teste-de-usabilidade": {
    example: "Cinco pessoas tentam agendar uma consulta no app enquanto o time observa onde elas travam.",
    tip: "Observe o que a pessoa faz, não só o que ela diz.",
  },
  "think-aloud": {
    example: "\"Estou procurando o botão de pagar… achei que estaria aqui embaixo.\"",
    tip: "Pensar em voz alta revela expectativas que o clique sozinho esconde.",
  },
  "tree-testing": {
    example: "Pedir que a pessoa encontre \"segunda via do boleto\" num menu só de texto.",
    tip: "Testa a árvore sem as folhas: estrutura sem layout.",
  },
  wayfinding: {
    example: "O item ativo destacado no menu e o título da página dizem onde a pessoa está.",
    tip: "Vem da sinalização de aeroportos e hospitais.",
  },
  wireframe: {
    example: "Caixas cinza indicando onde ficam o logo, a busca, os filtros e a lista de produtos.",
    tip: "Esqueleto: estrutura antes da pele.",
  },
};
