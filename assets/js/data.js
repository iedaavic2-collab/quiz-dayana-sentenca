/* ==========================================================================
   QUAL É A SUA SENTENÇA? — conteúdo do quiz 2 (Dayana Martins)
   Fonte dos textos: quiz-2-sentenca/01-perguntas-e-insercoes-v2.md (17/10/2026).
   Motor, pontuação, bônus e oferta: os mesmos do quiz 1 da Mayara.

   Convenções
   - {o|a}: concordância de gênero (G1). Homem → 1ª forma, Mulher → 2ª.
   - {variavel}: preenchida pelo app (ver ctx() em app.js).
   - p: pontos da alternativa no código da pergunta (0 a 3). p: null = neutra.
   - parecer: código avaliado na inserção; faixas = textos de Travado / Instável / De pé.
   - Fatos da Dayana: livro, entrevistas, reunião de 16/10 ou quiz 1 da Mayara (áudios da Dayana).
   - Sem o "5º lugar" do Márcio. Nenhuma estatística sem fonte.
   ========================================================================== */

/* Ordem canônica (resultado e aulas) */
const ORDEM_CANONICA = ['pratica', 'seposiciona', 'persevera', 'naoduvida', 'gesta', 'criaraiz', 'semeia'];

/* Desempates (iguais ao quiz 1) */
const DESEMPATE_TRAVADO = ['persevera', 'naoduvida', 'semeia', 'pratica', 'seposiciona', 'gesta', 'criaraiz'];
const DESEMPATE_FORTE = ORDEM_CANONICA;

const CODIGOS = {
  pratica: {
    nome: 'PRÁTICA', aula: 1,
    frase: 'Não basta saber. É preciso saber fazer.',
    travado: 'Você estuda, mas o estudo não vira treino. Muita aula, pouca questão; muito conteúdo novo, pouca revisão. A sensação é de progresso, mas na hora da prova o conteúdo não está lá.',
    forte: 'Você transforma conteúdo em treino. Questões e revisão já fazem parte da sua rotina.',
    acao: 'Ao terminar cada assunto, faça questões dele no mesmo dia e marque na agenda as próximas revisões.'
  },
  seposiciona: {
    nome: 'POSICIONAMENTO', aula: 2,
    frase: 'Coloque-se na posição em que aquilo que você deseja pode acontecer.',
    travado: 'Você ainda não se vê no lugar que deseja. Às vezes escolhe um cargo “possível”, às vezes deixa uma prova passar por achar que ainda não é a hora. A limitação não está na sua capacidade. Está em onde você se coloca.',
    forte: 'Você se coloca na posição: se inscreve, faz a prova, enfrenta a banca.',
    acao: 'Escreva o cargo que você realmente quer, sem diminuir. E se inscreva na próxima prova compatível, nem que seja como treino.'
  },
  persevera: {
    nome: 'PERSEVERANÇA', aula: 3,
    frase: 'Não pare durante a provação. A aprovação pode estar depois dela.',
    travado: 'A provação está pesando mais do que o propósito. Cada reprovação ou semana ruim abre a porta para a pergunta “será que é pra mim?”. E quem para no meio da provação não chega na aprovação.',
    forte: 'Você permanece. Já caiu e voltou.',
    acao: 'Decida hoje o que você faz no dia seguinte a uma prova ruim ou a uma semana perdida: qual assunto e qual hora. Decisão tomada antes da crise não depende do humor da crise.'
  },
  naoduvida: {
    nome: 'NÃO DUVIDAR', aula: 4,
    frase: 'Quem decidiu o destino não muda a rota a cada vento.',
    travado: 'Você está estudando com a mente dividida. Cada troca de curso, de material ou de concurso te devolve para o começo do edital e rouba a sua energia.',
    forte: 'Você decidiu a rota e mantém, mesmo quando aparece outra oportunidade.',
    acao: 'Escolha agora um concurso-alvo e um material-base. Escreva: “vou com eles até a prova oral”. Por 30 dias, nenhuma troca.'
  },
  gesta: {
    nome: 'GESTAR', aula: 5,
    frase: 'Não aborte o que ainda está sendo formado.',
    travado: 'A espera está te consumindo. Como o resultado ainda não aparece, a ansiedade diz que nada está acontecendo, e isso te faz duvidar do processo inteiro.',
    forte: 'Você entende que existe um tempo invisível e confia no processo.',
    acao: 'Troque a pergunta “quanto falta?” por “o que eu marquei hoje?”. Risque no edital cada assunto estudado e revisado. Ver o edital sendo riscado é ver a gestação acontecer.'
  },
  criaraiz: {
    nome: 'CRIAR RAIZ', aula: 6,
    frase: 'A profundidade que ninguém vê sustenta a altura que todos verão.',
    travado: 'O seu estudo está crescendo para cima sem criar raiz: muita interrupção, pouca profundidade, dificuldade de dizer não. O que cresce sem raiz não se sustenta até a prova.',
    forte: 'Você aceita a fase de profundidade e sabe dizer não.',
    acao: 'Nos próximos 7 dias, deixe o celular em outro cômodo durante a primeira hora de cada sessão de estudo.'
  },
  semeia: {
    nome: 'SEMEAR', aula: 7,
    frase: 'Você não controla o dia da colheita, mas controla o que planta todos os dias.',
    travado: 'A constância está falhando: alguns dias de muito estudo, outros de nada. E um dia perdido vira uma semana perdida.',
    forte: 'Você planta todos os dias, mesmo nos dias ruins.',
    acao: 'Defina a sua semente mínima: o mínimo que você estuda até no pior dia. Nos próximos 7 dias, não deixe que ela falhe.'
  }
};

/* Antes × depois (usado na página de vendas) */
const ANTES_DEPOIS = [
  { cod: 'pratica',     quando: 'você termina um assunto', a: 'Segue em frente e esquece', d: 'Faz questões e marca as revisões' },
  { cod: 'semeia',      quando: 'você perde um dia', a: 'Um dia vira uma semana', d: 'Retoma no dia seguinte' },
  { cod: 'criaraiz',    quando: 'você senta para estudar', a: 'O celular interrompe a cada 15 minutos', d: 'A primeira hora é só do edital' },
  { cod: 'naoduvida',   quando: 'sai outro edital', a: 'Troca o foco e recomeça', d: 'Segue na rota; no máximo, faz a prova como treino' },
  { cod: 'seposiciona', quando: 'abrem as inscrições', a: '“Ainda não é a hora”', d: 'Se inscreve e vai' },
  { cod: 'gesta',       quando: 'o resultado demora', a: '“Não estou saindo do lugar”', d: 'Olha o edital riscado e confia no processo' },
  { cod: 'persevera',   quando: 'uma prova dá errado', a: '“Será que é pra mim?”', d: 'Volta a estudar em poucos dias' }
];

/* Depoimentos: só a Adriana Lima (uso autorizado, segundo a Mayara). O print do Márcio ("5º lugar") ficou fora do quiz 2.
   trava = resposta da P22 em que o depoimento aparece; local 'pagina' = também na página de vendas. */
const DEPOIMENTOS = [
  { img: 'depo-adriana-2.jpg', nome: 'Adriana Lima', cargo: 'aluna da Mentoria Método Aprovação', ano: '2026',
    codigo: 'semeia', trava: 2, local: 'pagina',
    txt: 'Consegui cumprir tudo do cronograma. (…) E posso te afirmar que muito diferente de todas as outras vezes que tentei. Agora está sendo leve e prazeroso, pois estou aberta a viver o processo em paz.' },
  { img: 'depo-adriana-1.jpg', nome: 'Adriana Lima', cargo: 'aluna da Mentoria Método Aprovação', ano: '2026',
    codigo: 'seposiciona', trava: 3, local: 'pagina',
    txt: '(…) a mentoria não se trata apenas de saber como fazer, o que fazer ou por quanto tempo fazer, mas também de quem é você agora e de quem será quando a hora chegar.' }
];

/* Frases de incentivo: acima da 4ª, 8ª, 12ª… pergunta */
const MOTIVACAO = [
  { e: '⚖️', cor: 'ouro',    txt: 'Processo aberto. Cada resposta entra nos autos.' },
  { e: '📂', cor: 'verde',   txt: 'Agora vamos examinar as 7 provas da sua preparação.' },
  { e: '🧭', cor: 'azul',    txt: 'Você já passou de um terço dos autos.' },
  { e: '🔥', cor: 'vinho',   txt: 'Quase na metade. A sua sentença está tomando forma.' },
  { e: '💪', cor: 'preto',   txt: 'Você já passou da metade das provas.' },
  { e: '🔓', cor: 'roxo',    txt: 'Falta pouco para saber por onde começar.' },
  { e: '🏁', cor: 'laranja', txt: 'Reta final: as alegações finais.' },
  { e: '🏆', cor: 'petroleo', txt: 'Quase lá: a sentença está sendo redigida.' }
];

/* Helpers de condição (A = respostas) */
const sel = (A, id) => (A[id] ? A[id].idx : []);
const is = (A, id, i) => sel(A, id).includes(i);
const jaEstuda = A => is(A, 'Q2', 2) || is(A, 'Q2', 3);

/* --------------------------------------------------------------------------
   TELAS (ordem exata do fluxo)
   t: gender | q (única) | m (múltipla) | e (escala) | ins | diag | captura | resultado
   q, sub e txt das opções podem ser função de A (respostas).
   -------------------------------------------------------------------------- */
const TELAS = [

  /* ================= FASE 1 · ABERTURA DO PROCESSO ================= */
  { id: 'G1', t: 'gender', hero: true,
    selo: 'Ex-juíza · aprovada aos 23 anos, em 7º lugar',
    tit: 'Qual é a sua sentença?',
    sub: 'Responda e receba a sentença da sua preparação: o que está travando, o que mudar primeiro e o que fazer nos próximos 7 dias.',
    tempo: 'Leva poucos minutos.',
    q: 'Você é homem ou mulher?',
    o: [ { txt: 'Homem',  e: '👨', img: 'genero-homem.jpg' },
         { txt: 'Mulher', e: '👩', img: 'genero-mulher.jpg' } ] },

  { id: 'G2', t: 'q', layout: 'cards', q: 'Qual a sua idade?',
    o: [ { txt: 'Até 24 anos', e: '🌱', img: 'idade-{g}-1.jpg' },
         { txt: 'De 25 a 34',  e: '🔥', img: 'idade-{g}-2.jpg' },
         { txt: 'De 35 a 44',  e: '💪', img: 'idade-{g}-3.jpg' },
         { txt: '45 anos ou mais', e: '👑', img: 'idade-{g}-4.jpg' } ] },

  { id: 'Q1', t: 'q', q: 'Para qual carreira você está se preparando?',
    o: [ { txt: 'Magistratura', e: '⚖️' }, { txt: 'Ministério Público', e: '🏛️' },
         { txt: 'Delegado de Polícia', e: '🛡️' }, { txt: 'Tribunais (analista ou técnico)', e: '📂' },
         { txt: 'OAB ou outro concurso', e: '🎯' } ] },

  { id: 'Q2', t: 'q', q: 'Em que momento você está?',
    o: [ { txt: 'Ainda estou na faculdade', e: '🎓' }, { txt: 'Me formei e vou começar', e: '🚪' },
         { txt: 'Já estudo para concurso', e: '📚' }, { txt: 'Parei e quero voltar', e: '🔄' } ] },

  { id: 'Q2B', t: 'q', show: jaEstuda,
    q: A => is(A, 'Q2', 3) ? 'Quanto tempo você estudou antes de parar?' : 'Há quanto tempo você estuda?',
    o: [ { txt: 'Menos de 1 ano', e: '🌱' }, { txt: 'De 1 a 3 anos', e: '📘' },
         { txt: 'De 3 a 5 anos', e: '⏳' }, { txt: 'Mais de 5 anos', e: '🏔️' } ] },

  { id: 'Q3', t: 'q', q: 'Hoje você trabalha?',
    o: [ { txt: 'Sim, em tempo integral', e: '💼' }, { txt: 'Sim, meio período', e: '🕐' },
         { txt: A => is(A, 'Q2', 0) ? 'Não, só faculdade e estudo' : 'Não, só estudo', e: '📖' } ] },

  { id: 'Q4', t: 'q', q: 'Quantas provas para esse cargo você já fez?',
    o: [ { txt: 'Nenhuma ainda', e: '🚪' }, { txt: '1 ou 2', e: '✏️' },
         { txt: 'De 3 a 5', e: '📝' }, { txt: 'Mais de 5', e: '🗂️' } ] },

  { id: 'Q5', t: 'q', q: 'Sendo realista: quantas horas por dia você consegue estudar?',
    sub: A => is(A, 'Q2', 3) ? 'Pense em quanto conseguiria hoje.' : '',
    o: [ { txt: 'Menos de 2 horas', e: '⏱️' }, { txt: 'De 2 a 4 horas', e: '🕑' },
         { txt: 'De 4 a 6 horas', e: '🕓' }, { txt: 'Mais de 6 horas', e: '🕕' } ] },

  /* Fé: última da fase. idx 2 = não cristão → versículos viram nota (fe_tecnica). Nunca vai para o CRM. */
  { id: 'Q6', t: 'q', q: 'Você é crist{ão|ã}?',
    sub: 'Não existe resposta certa. Só muda a forma como eu te mostro a sentença.',
    o: [ { txt: 'Sim', e: '🙏' }, { txt: 'Não, mas tenho fé em Deus', e: '🕊️' },
         { txt: 'Não sou crist{ão|ã}', e: '🤝' } ] },

  { id: 'INS-A', t: 'ins', icone: 'balanca', fundo: 'dayana-toga.jpg', retrato: true, foco: '62% 6%',
    selo: 'Abertura dos autos',
    tit: A => is(A, 'Q2', 0) ? 'Processo aberto antes da primeira prova. Essa é a melhor hora: dá para construir certo desde a primeira página.'
            : is(A, 'Q2', 1) ? 'Processo aberto. Você está no começo, e isso é vantagem: ninguém precisa desaprender nada.'
            : is(A, 'Q2', 3) ? 'Um processo parado não é um processo encerrado. Vamos reabrir os autos.'
            : is(A, 'Q2B', 0) ? 'Você está no começo da preparação. É agora que a base se constrói.'
            : is(A, 'Q2B', 3) ? 'Mais de 5 anos de processo. Eu sei o peso disso. E quero te mostrar uma coisa.'
            : 'Você estuda há {tempo}. Não é falta de esforço. Vamos olhar os autos.',
    pontos: [
      { i: 'balanca', t: 'Aprovada juíza aos 23 anos, em 7º lugar, com menos de um ano de preparação. <b>Agora vou examinar a sua preparação.</b>' },
      { stat: { a: '29', al: 'vagas no meu concurso', b: '17', bl: 'tomaram posse. Quem ficou não sabia menos: parou antes' } }
    ],
    extras: [
      { when: A => is(A, 'Q1', 4), html: 'Os 7 códigos valem para qualquer prova. Os exemplos que eu vou te dar vêm da magistratura, o caminho que eu conheço por dentro.' },
      { when: A => is(A, 'Q2', 3), html: 'Você parou, mas está aqui. A sua sentença vai mostrar por onde recomeçar sem voltar à estaca zero.' },
      { when: A => is(A, 'Q3', 0) || is(A, 'Q5', 0), html: 'Você {trabalho_frase} e tem {horas} por dia. A sua sentença vai levar isso em conta: nada de cronograma impossível.' },
      { when: A => is(A, 'Q3', 2) && (is(A, 'Q5', 2) || is(A, 'Q5', 3)), html: 'Você tem tempo. Então a pergunta não é quanto você estuda. É o que acontece com esse tempo.' },
      { when: () => true, html: 'Você tem {horas} por dia. O que muda o resultado é o que você faz com essas horas, e é isso que vamos examinar.' }
    ],
    btn: 'Abrir os autos' },

  /* ================= FASE 2 · AS PROVAS (os 7 códigos) ================= */

  /* Prova 1 · PRÁTICA */
  { id: 'P1', t: 'q', cod: 'pratica', rotulo: 'Na sua semana',
    q: 'Numa semana normal, o que mais ocupa o seu estudo?',
    o: [ { txt: 'Assistir aulas', e: '🎥', p: 0 }, { txt: 'Ler material e lei seca', e: '📖', p: 1 },
         { txt: 'Resolver questões', e: '✍️', p: 3 }, { txt: 'Revisar o que já estudei', e: '🔁', p: 3 } ] },

  { id: 'P2', t: 'q', cod: 'pratica', rotulo: 'Quando termina um assunto',
    q: 'Terminou um assunto. E depois?',
    o: [ { txt: 'Sigo e não volto mais', e: '➡️', p: 0 }, { txt: 'Volto quando lembro', e: '🤔', p: 1 },
         { txt: 'Faço questões no mesmo dia', e: '✍️', p: 2 }, { txt: 'A revisão já fica agendada', e: '📅', p: 3 } ] },

  { id: 'P3', t: 'q', cod: 'pratica', rotulo: 'Voltas no edital',
    q: 'Quantas voltas completas você já deu no edital?',
    sub: 'Estudando e revisando tudo.',
    o: [ { txt: 'Ainda não terminei a primeira', e: '🚧', p: 0 }, { txt: 'Uma', e: '1️⃣', p: 1 },
         { txt: 'Duas ou três', e: '🔂', p: 2 }, { txt: 'Mais de três', e: '🏆', p: 3 } ] },

  { id: 'PAR1', t: 'ins', icone: 'lapis', fundo: 'cena-pratica.jpg', foco: '50% 32%', selo: 'Prova 1 de 7 · PRÁTICA',
    parecer: 'pratica',
    tit: 'O aprovado não apenas estuda. Ele pratica.',
    verso: { txt: 'Sejam praticantes da palavra, e não apenas ouvintes.', ref: 'Tiago 1:22' },
    pontos: [
      { i: 'repetir', t: 'Em uns 7 meses de estudo, eu revisei o edital <b>pelo menos 6 vezes</b>. Conteúdo só aparece na prova quando vira treino.' }
    ],
    faixas: {
      trav: 'Os autos mostram muito conteúdo entrando e pouco treino saindo. A sensação é de progresso, mas na prova o conteúdo não aparece.',
      inst: 'Você já pratica, mas sem calendário. Parte do que estuda escapa antes da próxima revisão.',
      pe: 'Prática de pé: questões e revisão já fazem parte da sua rotina.' },
    extras: [ { when: A => is(A, 'P2', 0), html: 'Você me disse que termina um assunto e não volta nele. É exatamente aí que o estudo escapa.' },
              { when: A => is(A, 'Q5', 0) || (sel(A, 'Q4').length > 0 && !is(A, 'Q4', 0)), html: 'Quando o tempo era curto, eu pegava as últimas 10 provas, tirava do plano o que nunca tinha caído e concentrava no que mais se repetia. Praticar também é escolher o que treinar.' },
              { when: A => is(A, 'P3', 0), html: 'Comece a revisar desde já: é isso que faz a primeira volta valer.' },
              { when: A => is(A, 'P3', 3), html: 'Mais de três voltas no edital. Agora é manter o ritmo até a prova.' } ],
    btn: 'Próxima prova' },

  /* Prova 2 · POSICIONAMENTO */
  { id: 'P4', t: 'q', cod: 'seposiciona', rotulo: 'Sobre o cargo',
    q: 'O cargo que você estuda é o que você realmente quer?',
    o: [ { txt: 'Sim, é o meu sonho', e: '⭐', p: 3 }, { txt: 'Ainda não decidi', e: '🤷', p: 1 },
         { txt: 'Escolhi um mais “possível”', e: '🪜', p: 0 }, { txt: 'Quero um maior, mas não digo', e: '🙊', p: 0 } ] },

  { id: 'P5', t: 'q', cod: 'seposiciona', rotulo: 'Sobre se inscrever',
    q: 'Você já deixou de fazer uma prova por achar que não era a hora?',
    o: [ { txt: 'Nunca: eu me inscrevo e vou', e: '🙋', p: 3 }, { txt: 'Uma ou duas vezes', e: '😬', p: 2 },
         { txt: 'Várias vezes', e: '😓', p: 1 }, { txt: 'Ainda não saiu edital', e: '📭', p: null } ] },

  { id: 'P6', t: 'e', cod: 'seposiciona',
    q: 'O quanto você concorda com esta frase?',
    frase: 'Concurso de alto nível é para quem é gênio.',
    o: [ { txt: 'Concordo totalmente', e: '✅', p: 0 }, { txt: 'Concordo em parte', e: '🤏', p: 1 },
         { txt: 'Não tenho certeza', e: '🤔', p: 2 }, { txt: 'Discordo', e: '❌', p: 3 } ] },

  { id: 'PAR2', t: 'ins', icone: 'alvo', fundo: 'cena-atacante.jpg', foco: '50% 20%', selo: 'Prova 2 de 7 · POSICIONAMENTO',
    parecer: 'seposiciona',
    tit: 'Quem chuta pode errar. Mas só quem se posiciona faz o gol.',
    pontos: [
      { i: 'alvo', t: 'Meu filho Lorenzo escolheu jogar de atacante: a posição que exige exposição, decisão e risco.' },
      { i: 'bandeira', t: 'Na prova oral, eu travava de medo de falar em público. Passei com uma frase: <b>Tá com medo? Vai com medo mesmo.</b>' }
    ],
    faixas: {
      trav: 'A sua capacidade não é o problema. O problema está em onde você se coloca: em um cargo “possível”, ou longe das provas que você já poderia fazer.',
      inst: 'Você já se posiciona, mas o medo ainda escolhe algumas provas por você.',
      pe: 'Posicionamento de pé: você se inscreve, faz a prova e enfrenta a banca.' },
    extras: [ { when: A => is(A, 'P4', 2) || is(A, 'P4', 3), html: 'Cargos de analista e técnico são excelentes. A pergunta é uma só: você escolheu por chamado ou por medo?' },
              { when: A => is(A, 'P6', 0), html: 'Você concorda que concurso de alto nível é para gênio. Eu estudei em escola pública no interior de Goiás.' } ],
    btn: 'Próxima prova' },

  /* Prova 3 · PERSEVERANÇA */
  { id: 'P7', t: 'q', cod: 'persevera', rotulo: 'Depois de uma prova ruim',
    show: A => sel(A, 'Q4').length > 0 && !is(A, 'Q4', 0),
    q: 'Depois de uma prova que não deu certo, quanto tempo levou para voltar?',
    o: [ { txt: 'Voltei em poucos dias', e: '🚀', p: 3 }, { txt: 'Algumas semanas', e: '🗓️', p: 2 },
         { txt: 'Alguns meses', e: '🌧️', p: 1 }, { txt: 'Ainda não voltei de verdade', e: '🥀', p: 0 } ] },

  { id: 'P8', t: 'q', cod: 'persevera', rotulo: 'Sobre desistir',
    q: 'Você já pensou em desistir?',
    o: [ { txt: 'Nunca pensei', e: '🦁', p: 3 }, { txt: 'Já pensei, mas passou', e: '🌤️', p: 2 },
         { txt: 'Penso com frequência', e: '🌧️', p: 1 }, { txt: 'Estou pensando agora', e: '⛈️', p: 0 } ] },

  { id: 'P9', t: 'e', cod: 'persevera',
    q: 'O quanto você concorda com esta frase?',
    frase: 'Se eu ainda não passei, talvez não seja o meu caminho.',
    o: [ { txt: 'Concordo totalmente', e: '✅', p: 0 }, { txt: 'Concordo em parte', e: '🤏', p: 1 },
         { txt: 'Não tenho certeza', e: '🤔', p: 2 }, { txt: 'Discordo', e: '❌', p: 3 } ] },

  { id: 'PAR3', t: 'ins', icone: 'montanha', fundo: 'cena-montanha.jpg', foco: '50% 32%', selo: 'Prova 3 de 7 · PERSEVERANÇA',
    parecer: 'persevera',
    tit: 'O aprovado permanece.',
    verso: { txt: 'Bem-aventurado o homem que persevera na provação, porque, depois de aprovado, receberá a coroa da vida.', ref: 'Tiago 1:12' },
    pontos: [
      { i: 'subindo', t: 'Fui reprovada no vestibular da PUC e, 30 dias depois, passei em 12º lugar na UFG. No concurso de delegado, fiquei de fora por 1 ponto, e aquilo me animou: eu estava perto.' }
    ],
    faixas: {
      trav: 'A provação está pesando mais do que o propósito. Cada prova ruim reabre a pergunta “será que é pra mim?”.',
      inst: 'Você volta, mas demora. E cada semana parada custa mais do que parece.',
      pe: 'Perseverança de pé: você já caiu e voltou.' },
    extras: [ { when: A => is(A, 'P8', 3), html: 'Se você está pensando em desistir agora, eu te peço uma coisa: termine estes autos. Depois você decide.' },
              { when: A => is(A, 'P7', 3), html: 'A sua sentença vai trazer o que fazer no dia seguinte a uma prova ruim.' } ],
    btn: 'Próxima prova' },

  /* Prova 4 · NÃO DUVIDAR */
  { id: 'P10', t: 'm', cod: 'naoduvida', score: 'contagem', rotulo: 'Nos últimos 12 meses, você trocou de',
    q: 'Nos últimos 12 meses, você trocou de:',
    o: [ { txt: 'Cursinho', e: '🏫' }, { txt: 'Material', e: '📚' }, { txt: 'Cronograma', e: '🗓️' },
         { txt: 'Concurso-alvo', e: '🎯' }, { txt: 'Não troquei nada', e: '✅', excl: true } ] },

  { id: 'P11', t: 'q', cod: 'naoduvida', rotulo: 'Quando sai outro edital',
    q: 'Saiu um edital diferente do seu. O que você faz?',
    o: [ { txt: 'Sigo no meu. No máximo, treino', e: '🧭', p: 3 },
         { txt: 'Fico tentad{o|a}, mas sigo', e: '😌', p: 2 },
         { txt: 'Mudo o foco por um tempo', e: '🔄', p: 1 },
         { txt: 'Estudo para ele também', e: '🤹', p: 0 } ] },

  { id: 'PAR4', t: 'ins', icone: 'bussola', fundo: 'cena-rota.jpg', foco: '50% 40%', selo: 'Prova 4 de 7 · NÃO DUVIDAR',
    parecer: 'naoduvida',
    tit: 'Quem decidiu o destino não muda a rota a cada vento.',
    verso: { txt: 'Aquele que duvida é semelhante à onda do mar, levada e agitada pelo vento.', ref: 'Tiago 1:6' },
    pontos: [
      { i: 'livro', t: 'Para a aluna que vive querendo trocar de material, eu digo: o material que você começa agora vai com você até a prova oral.' }
    ],
    faixas: {
      trav: 'Mente dividida. Cada troca te devolveu para o começo do edital e levou a energia que deveria ir para a revisão.',
      inst: 'A rota existe, mas balança quando aparece outra oportunidade.',
      pe: 'Não duvidar de pé: você decidiu a rota e mantém.' },
    extras: [ { when: A => trocasCount(A) >= 2, html: 'Você trocou de {lista_trocas} nos últimos 12 meses. Cada troca dessas foi um recomeço.' } ],
    btn: 'Próxima prova' },

  /* Prova 5 · GESTAR */
  { id: 'P12', t: 'q', cod: 'gesta', rotulo: 'Ao olhar o que falta',
    q: 'Quando você olha o quanto falta do edital, o que sente?',
    o: [ { txt: 'Tranquilidade: vou chegar', e: '😌', p: 3 }, { txt: 'Ansiedade, mas sigo', e: '😰', p: 2 },
         { txt: 'Que nunca vou terminar', e: '🌀', p: 1 }, { txt: 'Travo e não começo', e: '🧊', p: 0 } ] },

  { id: 'P13', t: 'q', cod: 'gesta', rotulo: 'Sobre ver resultado',
    q: 'Você sente que estuda e não vê resultado?',
    o: [ { txt: 'Não, vejo meu progresso', e: '📈', p: 3 }, { txt: 'Às vezes', e: '🤏', p: 2 },
         { txt: 'Quase sempre', e: '😕', p: 1 }, { txt: 'Sempre. Não saio do lugar', e: '🛑', p: 0 } ] },

  { id: 'PAR5', t: 'ins', icone: 'ampulheta', fundo: 'cena-gesta.jpg', foco: '50% 42%', selo: 'Prova 5 de 7 · GESTAR',
    parecer: 'gesta',
    tit: 'Existe um tempo em que o resultado ainda é invisível.',
    pontos: [
      { i: 'coracao', t: 'Com dois meses de gestação, o bebê já existe, mesmo que quase ninguém consiga vê-lo.' },
      { i: 'calendario', t: 'Eu fazia a conta com cada aluno: com as horas que ele tinha por dia, em quantos dias fechava o edital. <b>Quem sabe quando vai terminar para de perguntar se está devagar.</b>' }
    ],
    faixas: {
      trav: 'A espera está decidindo por você. Como o resultado não aparece, a ansiedade diz que nada está acontecendo.',
      inst: 'Você segue, mas a ansiedade cobra caro nas semanas sem resultado visível.',
      pe: 'Gestar de pé: você confia no tempo invisível.' },
    extras: [ { when: A => is(A, 'P12', 2) || is(A, 'P12', 3), html: 'Você não sabe quando termina, e é isso que pesa. Com {horas} por dia, o seu edital tem data para fechar. A sua sentença começa por aí.' },
              { when: A => is(A, 'P13', 2) || is(A, 'P13', 3), html: 'Você me disse que não vê resultado. Risque no edital cada assunto revisado: ver o edital sendo riscado é ver a gestação acontecer.' } ],
    btn: 'Próxima prova' },

  /* Prova 6 · CRIAR RAIZ */
  { id: 'P14', t: 'q', cod: 'criaraiz', rotulo: 'Até pegar o celular',
    q: 'Sentou para estudar. Em quanto tempo pega o celular?',
    o: [ { txt: 'Menos de 15 minutos', e: '📱', p: 0 }, { txt: 'De 15 a 30 minutos', e: '⏰', p: 1 },
         { txt: 'Uma hora ou mais', e: '⌛', p: 2 }, { txt: 'O celular fica longe', e: '🔕', p: 3 } ] },

  { id: 'P15', t: 'q', cod: 'criaraiz', rotulo: 'Sobre os “nãos”',
    q: 'Como você lida com os “nãos” da preparação?',
    sub: 'Festas, encontros, redes sociais…',
    o: [ { txt: 'Digo não em paz', e: '🕊️', p: 3 }, { txt: 'Digo não, mas me sinto só', e: '😶', p: 2 },
         { txt: 'Às vezes cedo', e: '🎉', p: 1 }, { txt: 'Não consigo abrir mão', e: '🙈', p: 0 } ] },

  { id: 'PAR6', t: 'ins', icone: 'arvore', fundo: 'cena-raiz.jpg', foco: '50% 40%', selo: 'Prova 6 de 7 · CRIAR RAIZ',
    parecer: 'criaraiz',
    tit: 'Antes de crescer para cima, a semente cresce para baixo.',
    pontos: [
      { i: 'casa', t: 'Estudar para concurso não tem segredo: é você, a cadeira e os exercícios. Herdei o quarto do meu irmão e fiz dele o meu quartel. Foi de lá que eu saí aprovada.' }
    ],
    faixas: {
      trav: 'O seu estudo cresce para cima sem criar raiz: muita interrupção, pouca profundidade.',
      inst: 'Você protege parte do estudo, mas a profundidade ainda depende do dia.',
      pe: 'Criar raiz de pé: você aceita a fase de profundidade e sabe dizer não.' },
    extras: [ { when: A => is(A, 'P15', 1), html: '<b>Se você se sente só agora, isso não é abandono. É raiz.</b>' },
              { when: A => is(A, 'P14', 0), html: 'Raiz não cresce em um solo revirado a cada 15 minutos.' } ],
    btn: 'Próxima prova' },

  /* Prova 7 · SEMEAR */
  { id: 'P16', t: 'q', cod: 'semeia', rotulo: 'Nos últimos 30 dias',
    q: 'Nos últimos 30 dias, em quantos dias você estudou de verdade?',
    o: [ { txt: 'Menos de 10', e: '😔', p: 0 }, { txt: 'De 10 a 20', e: '😐', p: 1 },
         { txt: 'De 20 a 25', e: '🙂', p: 2 }, { txt: 'Quase todos', e: '🔥', p: 3 } ] },

  { id: 'P16B', t: 'q', cod: 'semeia', rotulo: 'Quando perde um dia',
    q: 'Perdeu um dia de estudo. E aí?',
    o: [ { txt: 'Retomo no dia seguinte', e: '💪', p: 3 }, { txt: 'Compenso e me sobrecarrego', e: '🏋️', p: 2 },
         { txt: 'Bate a culpa e perco mais', e: '😞', p: 1 }, { txt: 'A semana inteira vai embora', e: '😩', p: 0 } ] },

  { id: 'PAR7', t: 'ins', icone: 'broto', fundo: 'cena-semeia.jpg', foco: '50% 20%', selo: 'Prova 7 de 7 · SEMEAR',
    parecer: 'semeia',
    tit: 'O aprovado entende a lei da semeadura.',
    verso: { txt: 'O que o homem semear, isso também colherá.', ref: 'Gálatas 6:7' },
    pontos: [
      { i: 'broto', t: 'Cada hora, cada questão, cada revisão é uma <b>semente</b>. Você não controla o dia da colheita, mas controla o que planta hoje.' }
    ],
    faixas: {
      trav: 'A constância está falhando: dias de muito estudo, dias de nada, e um dia perdido vira uma semana.',
      inst: 'Você planta, mas o ritmo depende do humor da semana.',
      pe: 'Semear de pé: você planta até nos dias ruins.' },
    extras: [ { when: A => is(A, 'Q5', 0), html: 'Com menos de 2 horas por dia, constância vale mais do que quantidade.' },
              { when: A => is(A, 'P16B', 2) || is(A, 'P16B', 3), html: 'Perder um dia não destrói a colheita. O que destrói é deixar um dia virar uma semana.' } ],
    btn: 'Alegações finais' },

  /* ================= FASE 3 · ALEGAÇÕES FINAIS ================= */
  { id: 'P17', t: 'e', show: A => is(A, 'Q6', 0) || is(A, 'Q6', 1),
    q: 'O quanto você concorda com esta frase?',
    frase: 'Se Deus quiser, eu passo.',
    o: [ { txt: 'Concordo totalmente', e: '✅' }, { txt: 'Concordo em parte', e: '🤏' },
         { txt: 'Não tenho certeza', e: '🤔' }, { txt: 'Discordo', e: '❌' } ] },

  { id: 'P18', t: 'q', q: 'Quando você se imagina numa cadeira de autoridade, o que sente?',
    o: [ { txt: 'Chamado e responsabilidade', e: '⚖️' }, { txt: 'Medo de não estar à altura', e: '😟' },
         { txt: 'Culpa por desejar tanto', e: '😶' }, { txt: 'Penso na estabilidade', e: '🏡' } ] },

  { id: 'P19', t: 'm', rotulo: 'Frases que você já ouviu',
    q: 'Quais dessas frases você já ouviu, ou disse a si mesm{o|a}?',
    o: [ { txt: '“Concurso é loteria”', e: '🎲' }, { txt: '“Isso não é para gente como a gente”', e: '🚫' },
         { txt: '“Você já passou da idade”', e: '⌛' }, { txt: '“Só passa quem pode parar tudo”', e: '💸' },
         { txt: '“Estuda tanto e não passa?”', e: '😒' }, { txt: 'Nenhuma dessas', e: '✨', excl: true } ] },

  { id: 'INS-F', t: 'ins', icone: 'coroa', fundo: 'cena-fe.jpg', foco: '50% 45%', selo: 'Alegações finais',
    tit: A => is(A, 'Q6', 2)
      ? 'Na palavra grega <em>dokimos</em>, “aprovado” é quem passou pela prova e se mostrou verdadeiro.'
      : 'A palavra que a Bíblia usa para “aprovado” é <em>dokimos</em>: quem passou pela prova e se mostrou verdadeiro.',
    verso: { txt: 'Esdras tinha decidido dedicar-se a estudar a lei do Senhor, a praticá-la e a ensiná-la.', ref: 'Esdras 7:10' },
    extras: [
      { when: A => is(A, 'P17', 0), html: 'Fé não substitui a revisão. Ela sustenta a constância. Esdras primeiro decidiu estudar, depois praticar.' },
      { when: A => is(A, 'P18', 1), html: 'Esse medo mostra que você entende o peso do cargo. Quem entende o peso é quem precisa ocupá-lo.' },
      { when: A => is(A, 'P18', 2), html: 'Desejar um lugar de responsabilidade não é vaidade quando o motivo é servir.' },
      { when: A => is(A, 'P18', 3), html: 'Estabilidade é um motivo legítimo. Mas, em uma preparação longa, só o propósito sustenta os dias ruins.' },
      { when: A => sel(A, 'P19').filter(i => i !== 5).length >= 2, html: 'Você já ouviu {frase_1}. Essa frase não é uma prova dos autos. É uma opinião.' },
      { when: () => true, html: 'Você sente o chamado e a responsabilidade. É assim que se prepara quem vai ocupar a cadeira.' }
    ],
    btn: 'Continuar' },

  { id: 'P20', t: 'q', q: 'Quando imagina o seu nome na lista, o que vem primeiro?',
    o: [ { txt: 'Estabilidade para a família', e: '🏡' }, { txt: 'O orgulho dos meus pais', e: '👪' },
         { txt: 'Servir e fazer justiça', e: '⚖️' }, { txt: 'Provar para mim mesm{o|a}', e: '🪞' } ] },

  { id: 'P21', t: 'q', q: 'Quem você mais quer que veja essa aprovação?',
    o: [ { txt: 'Meus pais', e: '👪' }, { txt: 'Meus filhos', e: '🧒' },
         { txt: 'Quem duvidou de mim', e: '👀' }, { txt: 'Eu, antes de todos', e: '🪞' } ] },

  { id: 'INS-D', t: 'ins', icone: 'livro', fundo: 'dayana-bracos-cruzados.jpg', retrato: true, foco: '55% 8%', selo: 'Antes da sentença',
    tit: 'Antes de redigir uma sentença, o juiz lê tudo de novo.',
    pontos: [
      { i: 'livro', t: 'Antes da toga, fui assessora de juízes e desembargadores. Redigir sentenças foi a minha verdadeira escola.' }
    ],
    extras: [
      { when: A => is(A, 'P21', 0), html: 'Você quer que os seus pais vejam. Eu entendo isso mais do que você imagina: de madrugada, meu pai sentava ao meu lado enquanto eu estudava.' },
      { when: A => is(A, 'P21', 1), html: 'Você quer que os seus filhos vejam. Eles já estão vendo: cada dia de estudo é uma lição.' },
      { when: A => is(A, 'P21', 2), html: 'Quem duvidou não precisa ser convencido. Precisa ver. E quem mostra é a sua constância.' },
      { when: A => is(A, 'P21', 3), html: 'Você quer provar para você mesm{o|a}. Essa é a aprovação que sustenta todas as outras.' }
    ],
    fecho: 'Agora eu vou reunir as 7 provas e redigir a sua sentença.',
    btn: 'Ver a minha sentença' },

  /* ================= FASE 4 · A SENTENÇA ================= */
  { id: 'DIAG', t: 'diag' },

  { id: 'P22', t: 'q', q: 'O que mais te trava hoje?',
    sub: 'Escolha a que mais pesa.',
    o: [ { txt: 'Falta um método claro', e: '📐' },
         { txt: 'Falta alguém que já passou', e: '🧭' },
         { txt: 'Constância: começo e paro', e: '🔁' },
         { txt: 'Falta direção e fé', e: '🙏' },
         { txt: 'Acreditar que é para mim', e: '💛' } ] },

  /* Resposta imediata à trava: a pessoa vê só a dela */
  { id: 'O1', t: 'ins', show: A => is(A, 'P22', 0), icone: 'repetir', fundo: 'cena-pratica.jpg', foco: '50% 32%',
    selo: 'Você respondeu: um método claro',
    tit: 'Você vai saber o que fazer em cada semana.',
    pontos: [
      { i: 'repetir', t: 'Em uns 7 meses de estudo, eu revisei o edital <b>pelo menos 6 vezes</b>.' },
      { i: 'lapis', t: 'No <b>Diário do Concurseiro</b>, você anota o que estudou, o que errou e o que <b>precisa revisar</b>.' },
      { i: 'play', t: 'E cada aula termina com uma prática para os próximos 7 dias. <b>Nada de teoria solta.</b>' }
    ],
    btn: 'Continuar' },
  { id: 'O2', t: 'ins', show: A => is(A, 'P22', 1), icone: 'balanca', fundo: 'dayana-toga.jpg', retrato: true, foco: '62% 6%',
    selo: 'Você respondeu: alguém que já passou',
    tit: 'Eu já passei por esse caminho. E vou com você.',
    pontos: [
      { i: 'balanca', t: 'Aprovada juíza aos 23 anos, em 7º lugar, com menos de um ano de preparação, no <b>primeiro e único</b> concurso de juiz que fiz.' },
      { i: 'pessoa', t: 'De 2011 a 2021, fui mentora de concurseiros. Nunca dei aula de Direito: eu ensinava <b>como estudar e como continuar</b>.' }
    ],
    btn: 'Continuar' },
  { id: 'O3', t: 'ins', show: A => is(A, 'P22', 2), icone: 'broto', fundo: 'cena-semeia.jpg', foco: '50% 20%', depoTrava: 2,
    selo: 'Você respondeu: constância',
    tit: 'Começar e parar tem solução: a semente mínima.',
    pontos: [
      { i: 'broto', t: 'No código SEMEAR, eu te ensino a <b>semente mínima</b>: o pouco que você faz até no pior dia.' },
      { i: 'casa', t: 'Eu estudei trabalhando: saía do tribunal às 13h, estudava à tarde e ia para o cursinho à noite.' }
    ],
    btn: 'Continuar' },
  { id: 'O4', t: 'ins', show: A => is(A, 'P22', 3), icone: 'maos', fundo: 'cena-fe.jpg', foco: '50% 45%', depoTrava: 3,
    selo: 'Você respondeu: direção e fé',
    tit: 'Você não precisa escolher entre método e fé.',
    pontos: [
      { i: 'coroa', t: 'Na Aula 8, <b>Aprovado diante de Deus</b>, eu mostro como colocar a fé na sua preparação.' },
      { i: 'livro', t: 'No <b>Devocional do Concurseiro</b>, são 30 dias com <b>um versículo e um estudo por dia</b>.' }
    ],
    btn: 'Continuar' },
  { id: 'O5', t: 'ins', show: A => is(A, 'P22', 4), icone: 'alvo', fundo: 'cena-atacante.jpg', foco: '50% 20%',
    selo: 'Você respondeu: acreditar que é para você',
    tit: 'Ninguém se sente pront{o|a}. Quem passa se posiciona mesmo assim.',
    pontos: [
      { i: 'casa', t: 'Eu estudei em escola pública no interior de Goiás.' },
      { i: 'subindo', t: 'Antes de passar para escrevente, aos 19 anos, fui reprovada para Fiscal de Posturas de Goiânia.' },
      { i: 'bandeira', t: '<b>Tá com medo? Vai com medo mesmo.</b>' }
    ],
    btn: 'Continuar' },

  { id: 'P23', t: 'q', q: 'Como você aprende melhor?',
    o: [ { txt: 'Assistindo', e: '🎥' }, { txt: 'Lendo', e: '📖' }, { txt: 'Os dois', e: '✨' } ] },

  { id: 'P24', t: 'q', q: 'Quanto você quer mudar isso agora?',
    o: [ { txt: 'Decidi: faço o que for preciso', e: '🔥' }, { txt: 'Quero muito', e: '💪' },
         { txt: 'Quero, mas tenho medo', e: '😟' }, { txt: 'Por enquanto, curiosidade', e: '👀' } ] },

  { id: 'CAPTURA', t: 'captura',
    tit: 'Para onde eu envio a íntegra da sua sentença?',
    sub: 'Você vai ver a fundamentação dos 7 códigos, a decisão sobre o que mudar primeiro e o que cumprir nos próximos 7 dias.',
    passos: [ [0, 'Lendo os autos'],
              [14, 'Fundamentando PRÁTICA, POSICIONAMENTO e PERSEVERANÇA'],
              [36, 'Fundamentando NÃO DUVIDAR, GESTAR, CRIAR RAIZ e SEMEAR'],
              [66, 'Redigindo o que cumprir nos próximos 7 dias'],
              [100, '✓ Sentença pronta'] ],
    btn: 'Ver a minha sentença completa' },

  { id: 'RESULTADO', t: 'resultado' }
];

/* Contagem de trocas (P10) — usada na prova NÃO DUVIDAR */
function trocasCount(A) {
  const s = sel(A, 'P10');
  return s.filter(i => i !== 4).length;
}

/* --------------------------------------------------------------------------
   PÁGINA DE VENDAS — mesmo produto, bônus e oferta do quiz 1
   -------------------------------------------------------------------------- */
const COR_CODIGO = { pratica: '#1f6f50', seposiciona: '#1d2f55', persevera: '#7a1f3a', naoduvida: '#0f5c63',
  gesta: '#4b2a7b', criaraiz: '#b4532a', semeia: '#a8842f' };

const AULAS = [
  { n: 1, cod: 'pratica', img: 'cena-pratica.jpg',     tit: 'Aula 1 · PRÁTICA',      txt: 'Como transformar conteúdo em treino, para a prova encontrar o que você estudou' },
  { n: 2, cod: 'seposiciona', img: 'cena-atacante.jpg', tit: 'Aula 2 · POSICIONAMENTO', txt: 'Como parar de escolher o cargo pelo medo e se colocar onde o seu sonho pode acontecer' },
  { n: 3, cod: 'persevera', img: 'cena-montanha.jpg',   tit: 'Aula 3 · PERSEVERANÇA',    txt: 'O que fazer no dia seguinte à reprovação, e por que a aprovação vem depois da provação' },
  { n: 4, cod: 'naoduvida', img: 'cena-rota.jpg',   tit: 'Aula 4 · NÃO DUVIDAR',   txt: 'Como escolher a rota e o material, e parar de voltar para a linha de partida' },
  { n: 5, cod: 'gesta', img: 'cena-gesta.jpg',       tit: 'Aula 5 · GESTAR',        txt: 'Como atravessar o tempo em que o resultado ainda é invisível, sem que a ansiedade decida por você' },
  { n: 6, cod: 'criaraiz', img: 'cena-raiz.jpg',    tit: 'Aula 6 · CRIAR RAIZ',    txt: 'Foco, renúncia e a solidão do concurso vista como raiz, não como abandono' },
  { n: 7, cod: 'semeia', img: 'cena-semeia.jpg',      tit: 'Aula 7 · SEMEAR',       txt: 'A semente mínima: constância para quem trabalha, tem família e dias ruins' },
  { n: 8, cod: null, bonus: true, img: 'cena-fe.jpg', tit: 'Aula 8 · BÔNUS · Aprovado diante de Deus', txt: 'Aprovação além do cargo: <em>dokimos</em>, a palavra de Esdras sobre levantar juízes e como colocar a fé na sua preparação' }
];

const BONUS = [
  /* valor: preço de referência riscado, definido pela Mayara em 07/10/2026. */
  { id: 'B1', ic: 'maos', valor: 197, cor: '#1f6f50', tit: 'Bônus 1 · <em>Devocional do Concurseiro: 30 dias</em>',
    txt: 'Um versículo e um estudo por dia, para começar o seu dia de estudo com Deus. Os 30 dias passam pelos 7 códigos da aprovação.',
    extra: { when: A => is(A, 'P22', 3), html: 'Você me disse que falta direção e fé para continuar. Este bônus foi feito para isso.' } },
  { id: 'B2', ic: 'montanha', valor: 97, cor: '#1d2f55', tit: 'Bônus 2 · <em>Protocolo da Reprovação</em>',
    txt: 'O que fazer nas primeiras 24 horas depois de uma reprovação.',
    numerado: true,
    itens: ['Não tomar decisão emocional', 'Analisar o resultado', 'Identificar os pontos fracos', 'Separar incapacidade de falta de preparação', 'Montar o plano de recuperação'] },
  { id: 'B3', ic: 'chave', valor: 97, cor: '#b4532a', tit: 'Bônus 3 · <em>Protocolo Antitrava</em>',
    txt: 'Como chegar ao dia da prova preparad{o|a} não apenas para responder questões, mas para conseguir acessar tudo o que você estudou.',
    rotulo: 'Para', itens: ['Ansiedade', 'Nervosismo', 'Branco', 'Pressão'] },
  { id: 'B4', ic: 'livro', valor: 39.9, cor: '#7a1f3a', tit: 'Bônus 4 · Livro digital <em>Minha Última Sentença</em>',
    txt: 'A minha história, da escola pública até a toga. Vendido separadamente por R$ 39,90.' },
  { id: 'B5', ic: 'calendario', valor: 197, cor: '#4b2a7b', tit: 'Bônus 5 · <em>Diário do Concurseiro</em>',
    txt: 'Um mapa simples para registrar o seu estudo e enxergar a sua evolução.',
    rotulo: 'Você registra', itens: ['Horas estudadas', 'Questões feitas', 'Percentual de acerto', 'Matérias estudadas', 'Dificuldades', 'Evolução', 'Nível de energia', 'Cumprimento das metas'],
    nota: 'E um bloco de anotações: <b>Estudei · Aprendi · Errei · Preciso revisar · Próximo passo</b>.' }
];

const OFERTA_ITENS = [
  { t: '7 aulas dos 7 Códigos da Aprovação' },
  { t: 'Aula bônus: Aprovado diante de Deus' },
  { t: '<em>Devocional do Concurseiro: 30 dias</em>', b: 'B1' },
  { t: '<em>Protocolo da Reprovação</em>', b: 'B2' },
  { t: '<em>Protocolo Antitrava</em>', b: 'B3' },
  { t: 'Livro digital <em>Minha Última Sentença</em>', b: 'B4' },
  { t: '<em>Diário do Concurseiro</em>', b: 'B5' }
];

const AUTORIDADE = [
  { i: 'balanca', cor: '#1d2f55', t: 'Aprovada juíza aos 23 anos, em 7º lugar, no primeiro e único concurso de juiz que fez' },
  { i: 'relogio', cor: '#1f6f50', t: 'Menos de 1 ano de preparação' },
  { i: 'escada', cor: '#b4532a', t: '20 anos dentro do Judiciário, de escrevente a juíza' },
  { i: 'pessoa', cor: '#4b2a7b', t: 'Mentora de concurseiros de 2011 a 2021' },
  { i: 'livro', cor: '#7a1f3a', t: 'Autora de <em>Minha Última Sentença</em>' }
];

const PARA_QUEM_E = [
  'você já tem conteúdo, mas não consegue constância',
  'você estuda e esquece',
  'você já pensou em desistir',
  'você troca de rota a cada edital',
  'você quer alguém que já passou te mostrando o caminho'
];
const PARA_QUEM_NAO_E = [
  'você quer passar sem estudar',
  'você procura aula de Direito (isso o seu cursinho já faz)',
  'você quer promessa de aprovação com data'
];

/* Valores das variáveis */
const VALORES = {
  tempo: ['menos de 1 ano', 'mais de 1 ano', 'mais de 3 anos', 'mais de 5 anos'],
  trabalho_frase: ['trabalha em tempo integral', 'trabalha meio período', 'hoje se dedica só aos estudos'],
  provas_frase: ['ainda não fez nenhuma prova para o cargo', 'já fez 1 ou 2 provas para o cargo', 'já fez de 3 a 5 provas', 'já fez mais de 5 provas'],
  carreira: ['a magistratura', 'o Ministério Público', 'a carreira de Delegado de Polícia', 'os tribunais', 'o seu concurso'],
  momento: ['ainda está na faculdade', 'acabou de se formar', 'já estuda para concurso', 'parou e quer voltar'],
  trocas: ['cursinho', 'material', 'cronograma', 'concurso-alvo'],
  horas: ['menos de 2 horas', 'de 2 a 4 horas', 'de 4 a 6 horas', 'mais de 6 horas'],
  frases: ['“Concurso é loteria”', '“Isso não é para gente como a gente”', '“Você já passou da idade”', '“Só passa quem pode parar tudo”', '“Estuda tanto e não passa?”'],
  falta: ['um método claro', 'alguém que já passou te mostrando o caminho', 'constância', 'direção e fé para continuar', 'acreditar que é para você']
};
