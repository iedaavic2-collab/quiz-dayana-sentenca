/* ==========================================================================
   OS 7 CÓDIGOS DA APROVAÇÃO — motor do quiz
   Conteúdo em data.js · Configuração em config.js
   QA: ?qa=1 mostra painel com pontuação · ?reset=1 limpa a sessão · ?tela=P20 pula para uma tela
   ========================================================================== */
(function () {
  'use strict';

  var C = window.CONFIG || {};
  var KEY = 'dm_sentenca_v1';
  var REGRA_VERSAO = 'v1-hipotese';
  var params = new URLSearchParams(location.search);
  var QA = params.get('qa') === '1';
  var PH = !!C.MOSTRAR_ESPACOS_RESERVADOS;

  if (params.get('reset') === '1') { try { sessionStorage.removeItem(KEY); } catch (e) {} }

  var $app = document.getElementById('app');
  var $bar = document.getElementById('progresso');
  var $voltar = document.getElementById('voltar');
  var $ctaFixo = document.getElementById('cta-fixo');

  /* ------------------------------ ESTADO ------------------------------ */
  function novaSessao() {
    var utms = {};
    params.forEach(function (v, k) {
      if (/^utm_/i.test(k) || ['fbclid', 'gclid', 'src', 'sck', 'xcod'].indexOf(k.toLowerCase()) >= 0) utms[k] = v;
    });
    return {
      sid: 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      inicio: new Date().toISOString(),
      url: location.href, ref: document.referrer || '',
      utms: utms, pos: 0, pilha: [], A: {}, lead: null,
      leadEnviado: false, leadPendente: false, vistas: {}, diagVisto: false, comecou: false
    };
  }
  function carregar() { try { var r = sessionStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function salvar() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = carregar() || novaSessao();
  var A = S.A;

  /* ------------------------------ UTIL ------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ehMulher() { return is(A, 'G1', 1); }
  function idxDe(id) { for (var i = 0; i < TELAS.length; i++) if (TELAS[i].id === id) return i; return -1; }
  function visivel(t) { return !t.show || !!t.show(A); }
  function unir(lista) {
    if (lista.length <= 1) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1];
  }

  var R = null; /* resultado calculado (cache) */

  function ctx() {
    var v = VALORES, x = {};
    var i;
    i = sel(A, 'Q2B')[0]; x.tempo = i != null ? v.tempo[i] : '';
    i = sel(A, 'Q2')[0]; x.momento = i != null ? v.momento[i] : '';
    i = sel(A, 'Q3')[0]; x.trabalho_frase = i != null ? v.trabalho_frase[i] : '';
    i = sel(A, 'Q4')[0]; x.provas_frase = i != null ? v.provas_frase[i] : '';
    i = sel(A, 'Q1')[0]; x.carreira = i != null ? v.carreira[i] : '';
    i = sel(A, 'Q5')[0]; x.horas = i != null ? v.horas[i] : '';
    x.lista_trocas = unir(sel(A, 'P10').filter(function (k) { return k < 4; }).map(function (k) { return v.trocas[k]; }));
    i = sel(A, 'P19').filter(function (k) { return k < 5; })[0]; x.frase_1 = i != null ? v.frases[i] : '';
    x.falta = unir(sel(A, 'P22').slice(0, 2).map(function (k) { return v.falta[k]; }));
    x.nome = S.lead && S.lead.nome ? esc(S.lead.nome) : '';
    x.como_recebe = esc(C.COMO_RECEBE || '');
    if (R) {
      x.CODIGO_TRAVADO = CODIGOS[R.travado].nome;
      x.codigo_forte = CODIGOS[R.forte].nome;
      x.segundo_codigo = R.segundo ? CODIGOS[R.segundo].nome : '';
      x.n_aula = CODIGOS[R.travado].aula;
    }
    return x;
  }
  function fill(str) {
    if (str == null) return '';
    var g = ehMulher();
    var s = String(str).replace(/\{([^{}|]*)\|([^{}|]*)\}/g, function (_, m, f) { return g ? f : m; });
    var c = ctx();
    return s.replace(/\{([a-zA-Z_]+)\}/g, function (m, k) { return c[k] != null ? c[k] : m; });
  }
  /* q, sub e txt podem ser texto ou função das respostas */
  function val(x) { return typeof x === 'function' ? x(A) : x; }
  function textoOpcao(t, i) { return fill(val(t.o[i].txt)); }

  /* ------------------------------ TRACKING ------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function track(ev, dados) {
    var d = Object.assign({ event: ev, session_id: S.sid }, dados || {});
    window.dataLayer.push(d);
    if (QA) console.log('[track]', ev, dados || '');
  }
  function fbq() { if (typeof window.fbq === 'function') window.fbq.apply(null, arguments); }
  if (C.META_PIXEL_ID) {
    /* Meta Pixel */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ------------------------------ PONTUAÇÃO ------------------------------ */
  function pontos(t, a) {
    if (!a || !a.idx || !a.idx.length) return null;
    if (t.score === 'contagem') {
      var ex = -1;
      t.o.forEach(function (o, i) { if (o.excl) ex = i; });
      if (a.idx.indexOf(ex) >= 0) return 3;
      var n = a.idx.length;
      return n === 1 ? 2 : n === 2 ? 1 : 0;
    }
    var p = t.o[a.idx[0]].p;
    return (p === null || p === undefined) ? null : p;
  }

  function calcular() {
    var tot = {}, max = {}, sc = {};
    ORDEM_CANONICA.forEach(function (c) { tot[c] = 0; max[c] = 0; });
    TELAS.forEach(function (t) {
      if (!t.cod || !visivel(t)) return;
      var p = pontos(t, A[t.id]);
      if (p === null) return;
      tot[t.cod] += p; max[t.cod] += 3;
    });
    ORDEM_CANONICA.forEach(function (c) { sc[c] = max[c] ? Math.round(tot[c] / max[c] * 100) : 50; });

    var todosDePe = ORDEM_CANONICA.every(function (c) { return sc[c] >= 70; });
    var min = Math.min.apply(null, ORDEM_CANONICA.map(function (c) { return sc[c]; }));
    var travado = todosDePe ? 'persevera' : DESEMPATE_TRAVADO.filter(function (c) { return sc[c] === min; })[0];

    var restantes = DESEMPATE_FORTE.filter(function (c) { return c !== travado; });
    var mx = Math.max.apply(null, restantes.map(function (c) { return sc[c]; }));
    var forte = restantes.filter(function (c) { return sc[c] === mx; })[0];

    var outros = DESEMPATE_TRAVADO.filter(function (c) { return c !== travado && c !== forte; });
    var min2 = Math.min.apply(null, outros.map(function (c) { return sc[c]; }));
    var segundo = outros.filter(function (c) { return sc[c] === min2; })[0];
    if (sc[segundo] >= 70) segundo = null;

    R = { scores: sc, travado: travado, forte: forte, segundo: segundo, todosDePe: todosDePe };
    return R;
  }

  function evidencias(cod, limite) {
    var lista = [];
    TELAS.forEach(function (t, ordem) {
      if (t.cod !== cod || !visivel(t)) return;
      var a = A[t.id], p = pontos(t, a);
      if (p === null || p >= 3) return;
      lista.push({ t: t, a: a, p: p, ordem: ordem });
    });
    lista.sort(function (x, y) { return x.p - y.p || x.ordem - y.ordem; });
    return lista.slice(0, limite || 3).map(function (e) {
      var t = e.t;
      if (t.t === 'e') return 'Você respondeu “' + textoOpcao(t, e.a.idx[0]) + '” para: “' + fill(t.frase) + '”';
      if (t.t === 'm') {
        var itens = e.a.idx.map(function (i) {
          var s = textoOpcao(t, i);
          return t.id === 'P10' ? s.toLowerCase() : s;
        });
        return fill(t.rotulo) + ': ' + unir(itens);
      }
      return fill(t.rotulo) + ': “' + textoOpcao(t, e.a.idx[0]) + '”';
    });
  }

  function leadScore() {
    var s = 0, sinais = [];
    var tab = {
      Q1: [25, 25, 20, 15, 5],
      Q2: [5, 10, 20, 15],
      Q4: [5, 15, 20, 20],
      P24: [25, 20, 10, 0]
    };
    Object.keys(tab).forEach(function (id) {
      var i = sel(A, id)[0];
      if (i == null) return;
      var v = tab[id][i] || 0;
      s += v;
      sinais.push({ id: id, resposta: textoOpcao(TELAS[idxDe(id)], i), pontos: v });
    });
    if (is(A, 'P22', 1)) { s += 10; sinais.push({ id: 'P22', resposta: 'Falta alguém que já passou', pontos: 10 }); }
    sinais.sort(function (a, b) { return b.pontos - a.pontos; });
    var grade = s >= 70 ? 'A' : s >= 40 ? 'B' : 'C';
    if (is(A, 'P24', 3)) grade = 'C'; /* "Por enquanto, é só curiosidade" */
    var acoes = { A: 'Contato humano no WhatsApp e oferta da MMA', B: 'Automação de nutrição e remarketing', C: 'Só e-mail de nutrição, sem remarketing pago' };
    return { score: s, raw: s, max: 100, grade: grade,
             label: grade === 'A' ? 'Prioridade para a MMA' : grade === 'B' ? 'Nutrir' : 'Frio',
             acao: acoes[grade], signals: sinais.slice(0, 3), version: REGRA_VERSAO };
  }

  /* ------------------------------ ENVIO DO LEAD ------------------------------ */
  function payload() {
    var r = R || calcular();
    var respostas = {};
    TELAS.forEach(function (t) {
      if (!A[t.id] || t.id === 'Q6' || t.id === 'P17') return; /* fé (Q6, P17) nunca sai do navegador */
      if (!visivel(t)) return;
      respostas[t.id] = A[t.id].idx.map(function (i) { return textoOpcao(t, i); }).join(' | ');
    });
    return {
      session_id: S.sid, quiz: 'os-7-codigos-da-aprovacao', regra: REGRA_VERSAO,
      inicio: S.inicio, enviado_em: new Date().toISOString(),
      url: S.url, referrer: S.ref, utms: S.utms,
      lead: S.lead, respostas: respostas,
      codigos: r.scores, codigo_travado: r.travado, codigo_forte: r.forte, segundo_codigo: r.segundo,
      lead_score: leadScore()
    };
  }
  function enviarLead() {
    if (!C.WEBHOOK_URL || S.leadEnviado) return;
    var corpo = JSON.stringify(payload());
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch(C.WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo, keepalive: true, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); S.leadEnviado = true; S.leadPendente = false; salvar(); })
      .catch(function () { clearTimeout(timer); S.leadPendente = true; salvar(); });
  }
  window.addEventListener('pagehide', function () {
    if (C.WEBHOOK_URL && S.lead && !S.leadEnviado && navigator.sendBeacon) {
      try { navigator.sendBeacon(C.WEBHOOK_URL, new Blob([JSON.stringify(payload())], { type: 'application/json' })); } catch (e) {}
    }
  });

  /* ------------------------------ IMAGENS ------------------------------ */
  function foto(img, cls) {
    if (!img) return '';
    return '<figure class="foto ' + (cls || '') + '"><img src="assets/img/' + esc(img.src) + '" alt="' + esc(img.alt) +
      '" data-ph="' + esc(img.ph) + '" data-arq="' + esc(img.src) + '" loading="lazy"></figure>';
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.depo img');
    if (!img) return;
    var ov = document.createElement('div');
    ov.className = 'zoom'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Print ampliado');
    ov.innerHTML = '<img src="' + esc(img.getAttribute('src')) + '" alt="' + esc(img.alt) + '"><button type="button" class="zoom-x" aria-label="Fechar">×</button>';
    function fechar() { ov.remove(); document.removeEventListener('keydown', tecla); img.focus && img.focus(); }
    function tecla(ev) { if (ev.key === 'Escape') fechar(); }
    ov.addEventListener('click', fechar);
    document.addEventListener('keydown', tecla);
    document.body.appendChild(ov);
    ov.querySelector('.zoom-x').focus();
  });
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG') return;
    if (el.closest('.cena-bg')) { document.body.classList.remove('cena-com-foto'); el.remove(); return; }
    if (el.dataset.card) { el.remove(); return; }
    var fig = el.closest('figure');
    if (!fig) return;
    if (PH && el.dataset.ph) {
      fig.classList.add('ph');
      fig.innerHTML = '<div class="ph-in"><span>FOTO</span><b>' + esc(el.dataset.ph) + '</b><small>assets/img/' + esc(el.dataset.arq) + '</small></div>';
    } else { fig.remove(); }
  }, true);

  /* ------------------------------ NAVEGAÇÃO ------------------------------ */
  function proximaVisivel(de) {
    for (var i = de + 1; i < TELAS.length; i++) if (visivel(TELAS[i])) return i;
    return TELAS.length - 1;
  }
  function avancar() {
    if (!S.comecou) { S.comecou = true; track('iniciou_quiz'); }
    S.pilha.push(S.pos);
    S.pos = proximaVisivel(S.pos);
    salvar();
    desenhar();
  }
  function voltar() {
    if (S.pilha.length) S.pos = S.pilha.pop();
    else {
      /* Sem histórico (ex.: aberto direto numa tela pelo ?tela=): volta para a tela visível anterior */
      var i = S.pos - 1;
      while (i > 0 && !visivel(TELAS[i])) i--;
      if (i < 0 || i === S.pos) return;
      S.pos = i;
    }
    salvar();
    desenhar();
  }
  $voltar.addEventListener('click', voltar);

  function progresso() {
    var vis = TELAS.filter(visivel);
    var t = TELAS[S.pos];
    var i = vis.indexOf(t);
    var pct = Math.max(2, Math.round((i + 1) / vis.length * 100));
    $bar.style.width = pct + '%';
    $bar.parentNode.setAttribute('aria-valuenow', pct);
  }

  var limpeza = null; /* função para cancelar timers da tela atual */

  /* Inserções fixas: o texto cabe inteiro na tela, sem rolar.
     A tela ocupa a altura visível; se o texto não couber, a letra e os espaços diminuem em até 4 passos.
     Só em telas muito baixas (abaixo de ~560 px) ainda pode sobrar rolagem, para nada ficar cortado. */
  /* ins-c5 encurta o depoimento da inserção para 2 linhas; ins-c6 tira o depoimento só em telas muito baixas (ele continua na prova e na página) */
  var PASSOS_INS = ['ins-c1', 'ins-c2', 'ins-c3', 'ins-c4', 'ins-c5', 'ins-c6'];
  function ajustarInsercao() {
    PASSOS_INS.concat('ins-rola').forEach(function (c) { document.body.classList.remove(c); });
    var tela = $app.querySelector('.tela');
    if (!tela || !document.body.classList.contains('modo-cena')) return;
    var topo = document.querySelector('.topo');
    var livre = window.innerHeight - (topo ? topo.offsetHeight : 0) - parseFloat(getComputedStyle($app).paddingTop || 0);
    document.documentElement.style.setProperty('--ins-h', Math.floor(livre) + 'px');
    for (var i = 0; i < PASSOS_INS.length && tela.scrollHeight > livre + 1; i++) document.body.classList.add(PASSOS_INS[i]);
    document.body.classList.toggle('ins-rola', tela.scrollHeight > livre + 1);
  }
  /* Números que contam de 0 até o valor quando aparecem na tela (ex.: 29 vagas, 17 posses) */
  function contar(raiz) {
    var els = raiz.querySelectorAll('[data-conta]');
    if (!els.length || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    function anima(el) {
      var alvo = +el.dataset.conta, t0 = null, dur = 1400;
      function passo(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(alvo * e);
        if (p < 1) requestAnimationFrame(passo);
      }
      el.textContent = '0';
      requestAnimationFrame(passo);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(anima); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); anima(en.target); } });
    }, { threshold: .6 });
    els.forEach(function (el) { io.observe(el); });
  }
  var ajusteTimer = null;
  window.addEventListener('resize', function () { clearTimeout(ajusteTimer); ajusteTimer = setTimeout(ajustarInsercao, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarInsercao);

  function desenhar() {
    if (limpeza) { limpeza(); limpeza = null; }
    var t = TELAS[S.pos];
    var h = '';
    switch (t.t) {
      case 'gender': h = telaGenero(t); break;
      case 'q': case 'e': h = telaPergunta(t, false); break;
      case 'm': h = telaPergunta(t, true); break;
      case 'ins': h = telaInsercao(t); break;
      case 'antesdepois': h = telaAntesDepois(t); break;
      case 'prova': h = telaProva(t); break;
      case 'diag': h = telaDiag(t); break;
      case 'captura': h = telaCaptura(t); break;
      case 'resultado': h = telaResultado(); break;
    }
    $app.className = 'app tela-' + t.t;
    var cena = t.t === 'ins';
    var fundo = '';
    if (cena) {
      /* Foto em tela cheia com máscara escura. Sem a foto, fica o fundo escuro com o ícone do código. */
      fundo = '<div class="cena-bg' + (t.foco ? ' cena-foco' : '') + (t.retrato ? ' cena-retrato' : '') + '" aria-hidden="true"' + (t.foco ? ' style="--foco:' + esc(t.foco) + '"' : '') + '>' +
        '<span class="cena-marca">' + icone(t.icone || 'estrela') + '</span>' +
        (t.fundo ? '<img src="assets/img/' + esc(t.fundo) + '" alt="" data-card="1">' : '') + '<i class="cena-mascara"></i></div>';
    }
    $app.innerHTML = fundo + '<div class="tela">' + h + '</div>';
    document.body.classList.toggle('modo-resultado', t.t === 'resultado');
    document.body.classList.toggle('modo-cena', cena);
    document.body.classList.toggle('cena-com-foto', cena && !!t.fundo);
    document.body.classList.toggle('ins-retrato', cena && !!t.retrato);
    $voltar.hidden = S.pos === 0 || t.t === 'resultado';
    $ctaFixo.hidden = true;
    progresso();
    window.scrollTo(0, 0);
    ajustarInsercao();
    contar($app);
    ligar(t);
    var foco = $app.querySelector('[data-foco]');
    if (foco) { try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); } }
    var n = TELAS.filter(visivel).indexOf(t) + 1;
    if (!S.vistas[t.id]) {
      S.vistas[t.id] = 1; salvar();
      track('s' + (n < 10 ? '0' : '') + n + '_' + t.id.toLowerCase(), { tela: t.id, tipo: t.t });
    }
    if (QA) painelQA();
  }

  /* ------------------------------ TELAS ------------------------------ */
  function numeroPergunta(t) {
    var n = 0;
    for (var i = 0; i < TELAS.length; i++) {
      var x = TELAS[i];
      if (!visivel(x) || ['gender', 'q', 'm', 'e'].indexOf(x.t) < 0) continue;
      n++;
      if (x === t) return n;
    }
    return 0;
  }
  function incentivo(t) {
    var n = numeroPergunta(t);
    if (n < 4 || n % 4 !== 0) return '';
    var m = MOTIVACAO[Math.min(n / 4 - 1, MOTIVACAO.length - 1)];
    return '<p class="incentivo inc-' + m.cor + '"><span class="inc-e" aria-hidden="true">' + m.e + '</span><span>' + fill(m.txt) + '</span></p>';
  }
  function cabecalhoPergunta(t) {
    var h = incentivo(t);
    h += '<h1 class="pergunta" tabindex="-1" data-foco>' + fill(val(t.q)) + '</h1>';
    if (t.frase) h += '<blockquote class="frase">“' + fill(t.frase) + '”</blockquote>';
    if (val(t.sub)) h += '<p class="sub">' + fill(val(t.sub)) + '</p>';
    return h;
  }

  function telaGenero(t) {
    var h = '<section class="capa">';
    h += '<div class="autora"><img src="assets/img/dayana-avatar-toga.jpg" alt="Dayana Martins" class="avatar" data-card="1">' +
      '<div><b>Dayana Martins</b><span>' + fill(t.selo) + '</span></div></div>';
    h += '<h1 class="hero" tabindex="-1" data-foco>' + fill(t.tit) + '</h1>';
    h += '<p class="hero-sub">' + fill(t.sub) + '</p>';
    h += '<p class="tempo">' + icone('relogio') + fill(t.tempo) + '</p>';
    h += '<h2 class="pergunta pergunta-capa">' + fill(t.q) + '</h2>';
    h += '<div class="cards cards-2">';
    t.o.forEach(function (o, i) {
      var on = is(A, t.id, i) ? ' on' : '';
      h += '<button type="button" class="card' + on + '" data-i="' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        '<span class="card-img"><span class="card-e" aria-hidden="true">' + o.e + '</span>' +
        '<img src="assets/img/' + o.img + '" alt="" data-card="1"></span>' +
        '<span class="card-t">' + o.txt + '</span></button>';
    });
    h += '</div></section>';
    return h;
  }

  function telaPergunta(t, multi) {
    var h = cabecalhoPergunta(t);
    if (multi) h += '<p class="sub sub-multi">Pode marcar mais de uma.</p>';
    if (t.layout === 'cards') {
      var g = ehMulher() ? 'm' : 'h';
      h += '<div class="cards cards-2">';
      t.o.forEach(function (o, i) {
        var on = is(A, t.id, i) ? ' on' : '';
        h += '<button type="button" class="card card-sm' + on + '" data-i="' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
          '<span class="card-img"><span class="card-e" aria-hidden="true">' + o.e + '</span>' +
          '<img src="assets/img/' + o.img.replace('{g}', g) + '" alt="" data-card="1"></span>' +
          '<span class="card-t">' + fill(o.txt) + '</span></button>';
      });
      return h + '</div>';
    }
    h += '<div class="opcoes' + (multi ? ' multi' : '') + '" role="' + (multi ? 'group' : 'radiogroup') + '">';
    t.o.forEach(function (o, i) {
      var on = is(A, t.id, i);
      h += '<button type="button" class="opt' + (on ? ' on' : '') + '" data-i="' + i + '" ' +
        (multi ? 'aria-pressed="' + on + '"' : 'role="radio" aria-checked="' + on + '"') + '>' +
        '<span class="e" aria-hidden="true">' + o.e + '</span><span class="t">' + fill(val(o.txt)) + '</span>' +
        (multi ? '<span class="check" aria-hidden="true"></span>' : '') + '</button>';
    });
    h += '</div>';
    if (multi) h += botaoFixo('Continuar', !sel(A, t.id).length);
    return h;
  }

  function botaoFixo(txt, desab) {
    return '<div class="rodape-fixo"><button type="button" class="btn" id="segue"' + (desab ? ' disabled' : '') + '>' + fill(txt) + '</button></div>';
  }

  function fe_tecnica() { return is(A, 'Q6', 2); }

  function blocoVerso(v) {
    if (!v) return '';
    return '<blockquote class="verso"><span class="verso-aspas" aria-hidden="true">“</span><p>' + v.txt + '</p><cite>' + v.ref + '</cite></blockquote>';
  }

  function telaInsercao(t) {
    var h = '<div class="ins-topo">';
    if (t.icone) h += '<span class="ins-ic">' + icone(t.icone) + '</span>';
    if (t.selo) h += '<p class="selo">' + t.selo + '</p>';
    h += '</div>';
    if (t.img) h += foto(t.img, 'foto-ins');
    var tit = typeof t.tit === 'function' ? t.tit(A) : t.tit;
    h += '<h1 class="tit-ins" tabindex="-1" data-foco>' + fill(tit) + '</h1>';
    if (t.verso && !fe_tecnica()) h += blocoVerso(t.verso);
    if (t.passos) {
      h += '<ol class="passos">' + t.passos.map(function (p, i) {
        return '<li' + (i === t.passos.length - 1 ? ' class="fim"' : '') + '>' + (i === t.passos.length - 1 ? icone('coroa') : '') + p + '</li>';
      }).join('') + '</ol>';
    }
    h += '<ul class="pontos">';
    (t.pontos || []).forEach(function (p) {
      var v = typeof p === 'function' ? p(A) : p;
      if (v.stat) {
        h += '<li class="stat"><div><b data-conta="' + v.stat.a + '">' + v.stat.a + '</b><span>' + v.stat.al + '</span></div><div><b data-conta="' + v.stat.b + '">' + v.stat.b + '</b><span>' + v.stat.bl + '</span></div></li>';
        return;
      }
      h += '<li class="ponto' + (v.destaque ? ' destaque' : '') + '"><span class="ponto-ic">' + icone(v.i) + '</span><p>' + fill(v.t) + '</p></li>';
    });
    h += '</ul>';
    /* Uma frase personalizada por inserção, no máximo: vale a primeira da lista que bater com as respostas */
    var linha = '';
    (t.extras || []).some(function (x) {
      if (!x.when(A)) return false;
      linha = fill(x.html);
      return true;
    });
    if (t.parecer) {
      /* Parecer do código: faixa (Travado / Instável / De pé) calculada com as respostas desta prova + a linha da resposta */
      var nota = calcular().scores[t.parecer];
      var fx = nota < 40 ? ['Travado', 'trav'] : nota < 70 ? ['Instável', 'inst'] : ['De pé', 'pe'];
      h += '<div class="parecer parecer-' + fx[1] + '"><div class="parecer-top"><span class="parecer-tag">' + icone('balanca') + 'Parecer</span>' +
        '<span class="parecer-faixa">' + fx[0] + '</span></div><p>' + fill(t.faixas[fx[1]]) + '</p>' +
        (linha ? '<p class="parecer-linha">' + linha + '</p>' : '') + '</div>';
    } else if (linha) {
      h += '<div class="pessoal"><span class="pessoal-tag">' + icone('pessoa') + 'Com base na sua resposta</span><p>' + linha + '</p></div>';
    }
    if (t.citacao) h += '<figure class="citacao"><blockquote>“' + t.citacao.txt + '”</blockquote><figcaption>' + t.citacao.autor + '</figcaption></figure>';
    if (t.caixa) h += '<div class="caixa caixa-ic">' + icone(t.caixa.i) + '<p>' + fill(t.caixa.t) + '</p></div>';
    var dep = depoDaInsercao(t);
    if (dep) h += dep;
    if (t.codigo) h += '<div class="codigo">' + icone('chave') + '<div><span>O código</span><p>' + t.codigo + '</p></div></div>';
    if (t.fecho) h += '<p class="fecho">' + fill(t.fecho) + '</p>';
    if (t.verso && fe_tecnica()) h += '<p class="verso-nota">“' + t.verso.txt + '” (' + t.verso.ref + ')</p>';
    h += botaoFixo(t.btn || 'Continuar');
    return h;
  }

  function telaAntesDepois(t) {
    var r = R || calcular();
    var h = '<h1 class="tit-ins" tabindex="-1" data-foco>' + t.tit + '</h1><p class="sub">' + t.sub + '</p><div class="ad">';
    ANTES_DEPOIS.forEach(function (l) {
      var meu = l.cod === r.travado;
      h += '<div class="ad-linha' + (meu ? ' meu' : '') + '">' +
        '<div class="ad-top"><b>' + icone(ICONE_CODIGO[l.cod]) + CODIGOS[l.cod].nome + '</b>' + (meu ? '<span class="tag">O seu código</span>' : '') + '</div>' +
        '<p class="ad-quando">Quando ' + l.quando + '…</p>' +
        '<div class="ad-cols"><div class="ad-a"><small>Travado</small>' + l.a + '</div><div class="ad-d"><small>Destravado</small>' + l.d + '</div></div></div>';
    });
    h += '</div><div class="caixa">' + t.caixa + '</div>' + botaoFixo(t.btn);
    return h;
  }

  function depoimentosHTML(lista, n) {
    var h = '';
    if (lista.length) {
      lista.slice(0, n).forEach(function (d) {
        h += '<figure class="depo">' + (d.img ? '<img src="assets/img/' + esc(d.img) + '" alt="Depoimento de ' + esc(d.nome) + ': ' + esc(d.txt || '') + '" loading="lazy" data-ph="Print do depoimento" data-arq="' + esc(d.img) + '">' : '') +
          (d.txt && !d.img ? '<blockquote>“' + esc(d.txt) + '”</blockquote>' : '') +
          '<figcaption>' + esc(d.nome) + (d.cargo ? ' · ' + esc(d.cargo) : '') + (d.ano ? ' · ' + esc(d.ano) : '') + '</figcaption></figure>';
      });
    } else if (PH) {
      for (var i = 1; i <= n; i++) h += '<div class="depo depo-ph"><span>DEPOIMENTO ' + i + '</span><b>Aguardando print autorizado</b><small>Adicionar em data.js → DEPOIMENTOS</small></div>';
    }
    return h;
  }
  /* Um depoimento por inserção, no contexto da resposta: pelo código da tela (depoCod) ou pela trava da P29 (depoTrava) */
  function depoDaInsercao(t) {
    if (!t.depoCod && t.depoTrava == null) return '';
    var d = null;
    DEPOIMENTOS.forEach(function (x) {
      if (d) return;
      if ((t.depoCod && x.codigo === t.depoCod) || (t.depoTrava != null && x.trava === t.depoTrava)) d = x;
    });
    if (!d) return '';
    return '<figure class="depo-ins">' + (d.txt ? '<blockquote>“' + esc(d.txt) + '”</blockquote>' : (d.img ? '<img src="assets/img/' + esc(d.img) + '" alt="Depoimento de ' + esc(d.nome) + '" loading="lazy">' : '')) +
      '<figcaption>' + esc(d.nome) + (d.cargo ? ' · ' + esc(d.cargo) : '') + (d.ano ? ' · ' + esc(d.ano) : '') + '</figcaption></figure>';
  }

  function telaProva(t) {
    var h = '<h1 class="tit-ins" tabindex="-1" data-foco>' + t.tit + '</h1><p class="sub">' + t.sub + '</p>';
    /* Os prints da tela de prova ficam lado a lado; tocar amplia */
    var lista = DEPOIMENTOS.filter(function (d) { return d.local !== 'pagina'; });
    h += '<div class="depos depos-lado">' + depoimentosHTML(lista, 2) + '</div>';
    if (lista.length) h += '<p class="depos-dica">Toque no print para ampliar.</p>';
    return h + botaoFixo(t.btn);
  }

  function telaDiag() {
    /* Diagnóstico grátis antes da captura (regra da skill): o código travado + "de acordo com o que você respondeu".
       Ficam para depois do formulário: o mapa dos 7 códigos, o código que sustenta e a primeira ação (o "plano"). */
    var r = calcular(), cod = CODIGOS[r.travado];
    var h = '<div class="diag-load" id="diag-load"' + (S.diagVisto ? ' hidden' : '') + '><div class="anel"></div><p>Examinando <b id="diag-cod">PRÁTICA</b>…</p></div>';
    h += '<section class="diag" id="diag"' + (S.diagVisto ? '' : ' hidden') + '>';
    h += '<p class="selo">A sua sentença · decisão</p>';
    if (r.todosDePe) {
      h += '<h1 class="tit-ins" tabindex="-1" data-foco>As 7 provas estão de pé.</h1>';
      h += '<p class="frase-cod">O desafio de quem já faz quase tudo certo é não parar. Por isso, o seu ponto de atenção é PERSEVERANÇA.</p>';
    } else {
      h += '<span class="ins-ic ins-ic-lg">' + icone(ICONE_CODIGO[r.travado]) + '</span>';
      h += '<h1 class="tit-ins" tabindex="-1" data-foco>Decido: a sua preparação começa por <span class="ouro">' + cod.nome + '</span>.</h1>';
      h += '<p class="frase-cod">' + cod.frase + '</p>';
      var ev = evidencias(r.travado, 3);
      if (ev.length) {
        h += '<div class="recap"><p class="recap-tit">Motivos, de acordo com o que você respondeu:</p><ul>' +
          ev.map(function (e) { return '<li>' + icone('check') + '<span>' + e + '</span></li>'; }).join('') + '</ul></div>';
      }
    }
    h += '<p class="diag-sub">A fundamentação completa vem na íntegra da sentença: os 7 códigos, o que já te sustenta e o que cumprir nos próximos 7 dias.</p>';
    h += '<ul class="cadeados">' + ORDEM_CANONICA.filter(function (c) { return c !== r.travado; }).map(function (c) {
      return '<li>' + icone(ICONE_CODIGO[c]) + '<span>' + CODIGOS[c].nome + '</span><i class="cadeado" aria-label="bloqueado">🔒</i></li>';
    }).join('') + '</ul>';
    h += '<div class="caixa">Sentença sobre a sua preparação, não sobre você. Código não é talento. É princípio, e princípio se aprende.</div>';
    h += '<p class="fecho">Para redigir a íntegra, só mais 3 perguntas.</p>';
    h += botaoFixo('Responder às últimas 3');
    h += '</section>';
    return h;
  }

  function telaCaptura(t) {
    var L = S.lead || {};
    var h = '<h1 class="tit-ins" tabindex="-1" data-foco>' + t.tit + '</h1><p class="sub">' + t.sub + '</p>';
    h += '<div class="proc" role="status" aria-live="polite"><div class="proc-top"><span id="proc-txt">' + t.passos[0][1] + '</span><b id="proc-pct">0%</b></div>' +
      '<div class="proc-bar"><i id="proc-bar"></i></div></div>';
    h += '<form class="form" id="form" novalidate>' +
      campo('nome', 'Seu primeiro nome', 'text', 'given-name', L.nome) +
      campo('email', 'Seu melhor e-mail', 'email', 'email', L.email) +
      campo('whatsapp', 'Seu WhatsApp (com DDD)', 'tel', 'tel', L.whatsapp) +
      '<p class="consent">Ao continuar, você concorda em receber conteúdos e ofertas da Dayana Martins por e-mail e WhatsApp. Você pode sair quando quiser.' +
      (C.POLITICA_URL ? ' <a href="' + esc(C.POLITICA_URL) + '" target="_blank" rel="noopener">Política de privacidade</a>' : (PH ? ' <span class="falta">[Política de privacidade: configurar]</span>' : '')) + '</p>' +
      '<button type="submit" class="btn" id="enviar" disabled>' + t.btn + '</button></form>';
    return h;
  }
  function campo(nome, rotulo, tipo, auto, val) {
    var extra = '';
    if (tipo === 'tel') { extra = ' inputmode="tel" placeholder="(62) 99999-9999" maxlength="16"'; val = VALIDA.mascara(val); }
    if (tipo === 'email') extra = ' inputmode="email" autocapitalize="none" spellcheck="false" placeholder="seuemail@gmail.com"';
    return '<label class="campo"><span>' + rotulo + '</span><input name="' + nome + '" type="' + tipo + '" autocomplete="' + auto + '"' +
      extra + ' value="' + esc(val || '') + '"><em class="erro" id="erro-' + nome + '"></em>' +
      (nome === 'email' ? '<button type="button" class="sugestao" id="sugestao-email" hidden></button>' : '') + '</label>';
  }

  /* ------------------------------ RESULTADO + PITCH ------------------------------ */
  function faixa(v) { return v < 40 ? ['Travado', 'f-trav'] : v < 70 ? ['Instável', 'f-inst'] : ['De pé', 'f-pe']; }

  function telaResultado() {
    var r = calcular();
    var trav = CODIGOS[r.travado], forte = CODIGOS[r.forte];
    var h = '';

    /* H1 — mapa */
    h += '<section class="res-mapa">';
    h += '<p class="selo">Íntegra da sentença</p>';
    h += '<h1 class="tit-res" tabindex="-1" data-foco>' + fill('{nome}, esta é a sua sentença') + '</h1>';
    h += '<p class="sec-rot">Fundamentação · os 7 códigos</p><div class="barras">';
    ORDEM_CANONICA.forEach(function (c) {
      var v = r.scores[c], f = faixa(v), meu = c === r.travado;
      h += '<div class="cb' + (meu ? ' meu' : '') + '"><div class="cb-top"><b>' + icone(ICONE_CODIGO[c]) + CODIGOS[c].nome + '</b><span class="faixa ' + f[1] + '">' + f[0] + '</span><span class="num">' + v + '</span></div>' +
        '<div class="trilho"><i data-w="' + v + '"></i></div></div>';
    });
    h += '</div><p class="nota">Leitura do momento, feita a partir das suas respostas. Não é um rótulo: código se treina.</p>';

    h += '<article class="card-res card-trav"><span class="tag">Dispositivo · comece por aqui</span><span class="card-ic">' + icone(ICONE_CODIGO[r.travado]) + '</span>';
    h += '<h2>O seu código mais travado: <span class="ouro">' + trav.nome + '</span></h2><p class="frase-cod">' + trav.frase + '</p><p>' + trav.travado + '</p>';
    var ev = evidencias(r.travado, 2);
    if (ev.length) h += '<p class="evid-linha"><b>Por que cheguei a esse resultado:</b> ' + ev.join(' · ') + '</p>';
    var acao = trav.acao + (r.travado === 'semeia' && is(A, 'Q5', 0) ? ' Com menos de 2 horas por dia, a constância vale mais do que a quantidade.' : '');
    h += '<div class="acao"><b>Cumprimento · o que fazer nos próximos 7 dias:</b><p>' + acao + '</p></div></article>';

    if (r.segundo) h += '<p class="atencao">Fique de olho também em <b>' + CODIGOS[r.segundo].nome + '</b>: <em>' + CODIGOS[r.segundo].frase + '</em></p>';

    if (r.scores[r.forte] >= 40) {
      h += '<article class="card-res card-forte"><span class="tag tag-sutil">O que já te sustenta</span><h2>' + forte.nome + '</h2><p>' + forte.forte + '</p>' +
        '<p>Não subestime isso. É daqui que você tira força para destravar o resto.</p></article>';
    } else {
      /* Nenhum código de pé: não afirmar uma força que as respostas não mostram */
      h += '<article class="card-res card-forte"><span class="tag tag-sutil">O mais perto de ficar de pé</span><h2>' + forte.nome + '</h2>' +
        '<p>Hoje, nenhum dos 7 códigos está de pé, e tudo bem: é por isso que você fez este teste. Entre eles, ' + forte.nome + ' é o que está mais perto. Os códigos se levantam um de cada vez.</p></article>';
    }
    h += '<p class="ponte">Você pode começar agora mesmo, só com a ação acima. Mas, se quiser que eu sente ao seu lado em cada um dos 7 códigos, continue lendo.</p>';
    h += '</section>';

    /* Antes × depois do código travado (primeiro impacto do pitch) */
    var adl = null;
    ANTES_DEPOIS.forEach(function (l) { if (l.cod === r.travado) adl = l; });
    if (adl) {
      h += '<section class="sec ad-pitch"><p class="selo">Hoje × destravado</p><h2 class="tit-sec">Quando ' + adl.quando + '…</h2>' +
        '<div class="adp"><div class="adp-a"><small>Hoje</small><p>' + adl.a + '</p></div><span class="adp-seta" aria-hidden="true">→</span>' +
        '<div class="adp-d"><small>Com ' + trav.nome + ' destravado</small><p>' + adl.d + '</p></div></div>';
      h += '<p class="rolar">↓ Role a tela e veja o seu plano completo ↓</p></section>';
    }

    /* H2 — carta */
    h += '<section class="sec carta">';
    h += '<h2 class="tit-sec">' + fill('{nome}, eu não vou te dar conteúdo. O seu cursinho já faz isso.') + '</h2>';
    h += foto({ src: 'dayana-blazer.jpg', alt: 'Dayana Martins', ph: 'Foto da Dayana de blazer azul' }, 'foto-carta');
    h += '<p>Eu quero sentar ao seu lado e te mostrar os 7 códigos que transformam conteúdo em aprovação.</p>';
    var conf = [];
    if (sel(A, 'Q1').length) conf.push('Você se prepara para <b>{carreira}</b>');
    if (sel(A, 'Q2B').length) conf.push('Você estuda há <b>{tempo}</b>');
    else if (sel(A, 'Q2').length) conf.push('Você <b>{momento}</b>');
    if (sel(A, 'Q3').length) conf.push('Você <b>{trabalho_frase}</b>');
    if (sel(A, 'P22').length) conf.push('O que mais falta hoje: <b>{falta}</b>');
    h += '<div class="conforme"><p class="conf-tit">Relatório · o que você me contou:</p><ul>' +
      conf.map(function (c) { return '<li>' + icone('check') + '<span>' + fill(c) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="conf-verde">' + icone('check') + '<span>' + fill('Com base nessas respostas, o seu plano começa pelo código <b>{CODIGO_TRAVADO}</b>.') + '</span></p></div>';
    if (is(A, 'P24', 2)) h += '<p>E não, você não precisa dar conta de tudo de uma vez. A gente começa por um código.</p>';
    h += '</section>';

    /* H3 — mecanismo */
    h += '<section class="sec mecanismo"><p class="mec-intro">No meu concurso de juíza:</p>' +
      '<div class="contadores"><div><b data-conta="29">29</b><span>vagas no edital</span></div><div><b data-conta="17">17</b><span>tomaram posse</span></div></div>';
    h += '<p class="mec-frase">Sobraram vagas porque muita gente parou antes. A aprovação pertence a quem passou pela prova.</p>';
    h += '<p class="mec-dok">' + (fe_tecnica() ? 'Na palavra grega <em>dokimos</em>, “aprovado” é aquele que foi provado e permaneceu.'
                                             : 'Na Bíblia, “aprovado” é <em>dokimos</em>: aquele que foi provado e permaneceu.') + '</p></section>';

    h += '<section class="sec requisitos"><h2 class="tit-sec">O que você precisa para destravar a sua aprovação?</h2><ol class="req">' +
      '<li><span class="req-n">1</span><span>' + fill('O tempo que você já tem: <b>{horas}</b> por dia.') + '</span></li>' +
      '<li><span class="req-n">2</span><span>' + fill('Saber por onde começar: o código <b>{CODIGO_TRAVADO}</b>.') + '</span></li>' +
      '<li><span class="req-n">3</span><span>Os 7 códigos, um de cada vez, com uma prática para cada semana.</span></li></ol>' +
      '<p class="req-fim">Os três estão no plano abaixo.</p></section>';

    var fe = is(A, 'P22', 3);
    var produto = secProduto(r, fe), bonus = secBonus(fe);
    h += is(A, 'P23', 1) ? bonus + produto : produto + bonus;

    /* H6 — autoridade */
    h += '<section class="sec autoridade"><h2 class="tit-sec">Quem está falando com você</h2>';
    h += foto({ src: 'dayana-preto.jpg', alt: 'Dayana Martins', ph: 'Foto da Dayana de vestido preto' }, 'foto-aut');
    h += '<ul class="aut-lista">' + AUTORIDADE.map(function (a) {
      return '<li style="--cor:' + a.cor + '"><span class="aut-ic">' + icone(a.i) + '</span><span>' + a.t + '</span></li>';
    }).join('') + '</ul>';
    /* Na página de vendas, só o depoimento marcado com local: 'pagina' (os outros ficam na tela de prova) */
    var dPag = DEPOIMENTOS.filter(function (d) { return d.local === 'pagina'; });
    if (dPag.length) h += '<h3 class="depos-tit">' + (dPag.length > 1 ? 'O que os alunos me mandaram' : 'O que um aluno me mandou') + '</h3><div class="depos">' + depoimentosHTML(dPag, 3) + '</div>';
    h += '</section>';

    /* H7 — para quem é */
    h += '<section class="sec quem"><h2 class="tit-sec">Para quem é</h2><div class="quem-cols">' +
      '<div class="quem-sim"><b>É para você se:</b><ul>' + PARA_QUEM_E.map(function (x) { return '<li>' + icone('check') + '<span>' + x + '</span></li>'; }).join('') + '</ul></div>' +
      '<div class="quem-nao"><b>Não é para você se:</b><ul>' + PARA_QUEM_NAO_E.map(function (x) { return '<li>' + icone('proibido') + '<span>' + x + '</span></li>'; }).join('') + '</ul></div></div></section>';

    /* H8 — oferta */
    h += '<section class="sec oferta" id="oferta"><div class="oferta-box"><h2 class="tit-sec">Tudo o que você recebe hoje</h2><ul class="check">' +
      OFERTA_ITENS.map(function (x) {
        var b = x.b ? bonusPorId(x.b) : null;
        return '<li><span>' + x.t + '</span>' + (b ? '<s>' + reais(b.valor) + '</s>' : '') + '</li>';
      }).join('') + '</ul>' +
      '<p class="de">de <s>' + reais(totalBonus()) + '</s></p>' +
      '<p class="preco"><small>por</small> ' + esc(C.PRECO || 'R$ 47,00') + ' <small>à vista</small></p>' +
      (C.PARCELAS_TEXTO ? '<p class="parcelas">' + esc(C.PARCELAS_TEXTO) + '</p>' : '') +
      botaoCheckout('cta-oferta') +
      '<p class="seguro">Pagamento seguro · Garantia de 7 dias' + (C.ACESSO_TEXTO ? ' · ' + esc(C.ACESSO_TEXTO) : '') + '</p>' +
      (C.COMO_RECEBE ? '<p class="seguro">' + esc(C.COMO_RECEBE) + '</p>' : '') + '</div></section>';

    /* H9 — garantia: brasão e uma frase */
    h += '<section class="sec garantia">' + brasaoSVG() + '<p class="gar-frase">Assista, conheça os bônus e decida. Se não for para você, peça o reembolso em até 7 dias e receba 100% do valor.</p></section>';

    /* H11 — fechamento */
    var assentos = '';
    for (var k = 0; k < 29; k++) assentos += '<i class="assento' + (k < 17 ? ' posse' : '') + '" style="--d:' + (k * 55) + 'ms">' + icone('pessoa') + '</i>';
    h += '<section class="sec fechamento"><div class="impacto" id="impacto">' +
      '<p class="imp-pergunta">Lembra-se das 29 vagas e dos 17 que tomaram posse?</p>' +
      '<div class="assentos" aria-hidden="true">' + assentos + '</div>' +
      '<p class="imp-legenda"><span class="leg-posse">' + icone('pessoa') + '17 tomaram posse</span><span class="leg-vaga">' + icone('pessoa') + '12 vagas sobraram</span></p>' +
      '<p class="imp-frase">Eu quero ver você entre os que chegam até o fim.</p>' +
      '<p class="imp-assina">Dayana Martins</p></div>' + botaoCheckout('cta-final') + '</section>';

    h += rodape();
    return h;
  }

  function reais(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
  function bonusPorId(id) { for (var i = 0; i < BONUS.length; i++) if (BONUS[i].id === id) return BONUS[i]; return null; }
  function totalBonus() { return BONUS.reduce(function (t, b) { return t + (b.valor || 0); }, 0); }

  /* Brasão da garantia: roseta dourada, louros, "7 DIAS" e faixa "GARANTIA" (SVG gerado aqui) */
  function brasaoSVG() {
    var cx = 100, cy = 98, i, a, pts = [], folhas = '';
    for (i = 0; i < 72; i++) { a = Math.PI * 2 * i / 72; var rr = i % 2 ? 88 : 95; pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); }
    [1, -1].forEach(function (lado) {
      for (i = 0; i < 9; i++) {
        var th = (122 + i * 13) * Math.PI / 180, deg = th * 180 / Math.PI + 90;
        [[64, -32], [56, 32]].forEach(function (f) {
          var x = cx + f[0] * Math.cos(th), y = cy + f[0] * Math.sin(th), rot = deg + f[1];
          if (lado < 0) { x = 2 * cx - x; rot = 180 - rot; }
          folhas += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="7" ry="2.8" transform="rotate(' + rot.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
        });
      }
    });
    function estrela(x, y, r) {
      var p = [];
      for (var k = 0; k < 10; k++) { var an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; p.push((x + rr * Math.cos(an)).toFixed(1) + ',' + (y + rr * Math.sin(an)).toFixed(1)); }
      return '<polygon points="' + p.join(' ') + '"/>';
    }
    return '<svg class="brasao" viewBox="0 0 200 200" role="img" aria-label="Garantia de 7 dias">' +
      '<defs><linearGradient id="bOuro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1dca6"/><stop offset=".5" stop-color="#c8a85e"/><stop offset="1" stop-color="#9c7a34"/></linearGradient>' +
      '<radialGradient id="bFundo" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#26262a"/><stop offset="1" stop-color="#0b0b0c"/></radialGradient></defs>' +
      '<polygon points="' + pts.join(' ') + '" fill="url(#bOuro)"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="82" fill="url(#bFundo)" stroke="#f1dca6" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="75" fill="none" stroke="url(#bOuro)" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<g fill="url(#bOuro)">' + folhas + estrela(84, 52, 5) + estrela(100, 47, 6.5) + estrela(116, 52, 5) + '</g>' +
      '<text x="100" y="122" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="76" fill="url(#bOuro)">7</text>' +
      '<text x="100" y="140" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="12" letter-spacing="5" fill="#f1dca6">DIAS</text>' +
      '<path d="M8 150 L30 150 L30 182 L8 182 L18 166 Z M192 150 L170 150 L170 182 L192 182 L182 166 Z" fill="#9c7a34"/>' +
      '<path d="M24 146 H176 V176 H24 Z" fill="url(#bOuro)"/>' +
      '<text x="100" y="166" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="800" font-size="13" letter-spacing="4" fill="#0b0b0c">GARANTIA</text>' +
      '</svg>';
  }

  function secProduto(r, fe) {
    var ini = 0;
    AULAS.forEach(function (a, k) { if (a.cod === r.travado) ini = k; });
    var h = '<section class="sec produto"><p class="selo">As aulas</p><h2 class="tit-sec">Os 7 Códigos da Aprovação</h2>';
    h += '<p class="lead"><b>8 aulas gravadas comigo:</b> uma para cada código e uma sobre fé e preparação.</p>';
    h += '<div class="aulas-circ">';
    AULAS.forEach(function (a, k) {
      var meu = a.cod === r.travado, dest = a.bonus && fe;
      h += '<button type="button" class="aula-circ' + (meu ? ' meu' : '') + '" data-aula="' + k + '" aria-pressed="' + (k === ini) + '" style="--cor:' + (a.cod ? COR_CODIGO[a.cod] : '#0b0b0c') + '">' +
        '<span class="circ"><img src="assets/img/' + esc(a.img) + '" alt="" loading="lazy"><i class="circ-ic">' + icone(a.cod ? ICONE_CODIGO[a.cod] : 'coroa') + '</i></span>' +
        '<b>Aula ' + a.n + '</b><small' + (a.cod && CODIGOS[a.cod].nome.length > 10 ? ' class="longo"' : '') + '>' + (a.cod ? CODIGOS[a.cod].nome : 'Bônus: fé') + '</small>' +
        (meu ? '<em class="circ-tag">Comece aqui</em>' : dest ? '<em class="circ-tag">Para você</em>' : '') + '</button>';
    });
    h += '</div><p class="aulas-dica">Toque em uma aula para ver o que ela ensina.</p>';
    h += '<div class="aula-desc" id="aula-desc" aria-live="polite">' + descAula(ini) + '</div>';
    h += '</section>';
    /* O pitch é o plano: 3 etapas numeradas, a última é a da vitória */
    h += '<section class="sec plano"><p class="selo">O seu plano</p><h2 class="tit-sec">O seu plano em 3 etapas</h2><ol class="etapas">' +
      '<li style="--cor:' + COR_CODIGO[r.travado] + '"><span class="et-n">1</span><div><b>' + fill('Destravar {CODIGO_TRAVADO}') + '</b><p>' + fill('Comece pela Aula {n_aula} e pela sua ação dos próximos 7 dias.') + '</p></div></li>' +
      '<li style="--cor:#1d2f55"><span class="et-n">2</span><div><b>Colocar os outros 6 códigos de pé</b><p>As outras aulas, com o Diário do Concurseiro para ver a sua evolução e o Devocional do Concurseiro para começar cada dia.</p></div></li>' +
      '<li class="fim" style="--cor:#a8842f"><span class="et-n">' + icone('coroa') + '</span><div><b>' + fill('Chegar à prova pront{o|a}') + '</b><p>O Protocolo Antitrava para acessar tudo o que você estudou no dia da prova. E, se o resultado não vier, o Protocolo da Reprovação.</p></div></li></ol></section>';
    return h;
  }
  function descAula(k) {
    var a = AULAS[k], r = R || calcular(), meu = a.cod === r.travado;
    return '<div class="aula-desc-in" style="--cor:' + (a.cod ? COR_CODIGO[a.cod] : '#0b0b0c') + '"><div class="aula-desc-top"><b>' + icone(a.cod ? ICONE_CODIGO[a.cod] : 'coroa') + a.tit + '</b>' +
      (meu ? '<span class="tag">Comece por aqui</span>' : '') + '</div><p>' + a.txt +
      (a.bonus && fe_tecnica() ? ' <span class="compl">Para quem quiser ir mais fundo. Os 7 códigos funcionam com ou sem ela.</span>' : '') + '</p></div>';
  }

  function secBonus(fe) {
    var h = '<section class="sec bonus"><h2 class="tit-sec">E você ainda recebe 5 bônus</h2><div class="bonus-lista">';
    /* Para quem não é cristão, o devocional (B1) vai para o fim da lista. Quem trava em "direção e fé" vê o devocional marcado como "Para você". */
    var lista = BONUS.slice();
    if (fe_tecnica()) lista.push(lista.shift());
    lista.forEach(function (b) {
      var dest = fe && b.id === 'B1';
      h += '<article class="bonus-item' + (dest ? ' dest' : '') + '" style="--cor:' + b.cor + '"><span class="bonus-e">' + icone(b.ic) + '</span><div><h3>' + b.tit +
        (dest ? ' <span class="tag tag-sutil">Para você</span>' : '') + '</h3><p>' + fill(b.txt) + '</p>' +
        (b.itens ? (b.rotulo ? '<p class="bonus-rot">' + b.rotulo + '</p>' : '') + '<' + (b.numerado ? 'ol' : 'ul') + ' class="bonus-itens">' +
          b.itens.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</' + (b.numerado ? 'ol' : 'ul') + '>' : '') +
        (b.nota ? '<p class="bonus-nota">' + b.nota + '</p>' : '') +
        (b.extra && b.extra.when(A) ? '<p class="pessoal-mini">' + fill(b.extra.html) + '</p>' : '') +
        (b.valor ? '<p class="bonus-preco"><s>' + reais(b.valor) + '</s><b>incluso</b></p>' : '') + '</div></article>';
    });
    return h + '</div></section>';
  }

  function botaoCheckout(id, txt) {
    return '<button type="button" class="btn btn-cta" data-checkout="' + id + '">' + fill(txt || 'Quero destravar o meu código {CODIGO_TRAVADO}') + '</button>';
  }

  function rodape() {
    var partes = [];
    if (C.EMPRESA_RAZAO) partes.push(esc(C.EMPRESA_RAZAO));
    if (C.EMPRESA_CNPJ) partes.push('CNPJ ' + esc(C.EMPRESA_CNPJ));
    if (C.POLITICA_URL) partes.push('<a href="' + esc(C.POLITICA_URL) + '" target="_blank" rel="noopener">Política de privacidade</a>');
    if (C.TERMOS_URL) partes.push('<a href="' + esc(C.TERMOS_URL) + '" target="_blank" rel="noopener">Termos de uso</a>');
    if (!partes.length && PH) partes.push('<span class="falta">[Rodapé: razão social, CNPJ, política e termos → config.js]</span>');
    return '<footer class="rodape"><p class="aviso-legal">Os resultados dependem do estudo e da dedicação de cada pessoa. Não há garantia de aprovação.</p>' +
      partes.join(' · ') + '<p>© ' + new Date().getFullYear() + ' Dayana Martins</p></footer>';
  }

  function urlCheckout(origem) {
    if (!C.CHECKOUT_URL) return '';
    try {
      var u = new URL(C.CHECKOUT_URL);
      Object.keys(S.utms || {}).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, S.utms[k]); });
      u.searchParams.set('src', 'quiz-7-codigos');
      if (R) u.searchParams.set('sck', 'codigo-' + R.travado + '-' + origem);
      return u.toString();
    } catch (e) { return C.CHECKOUT_URL; }
  }

  /* ------------------------------ EVENTOS DAS TELAS ------------------------------ */
  function ligar(t) {
    var seg = document.getElementById('segue');

    if (t.t === 'gender' || t.t === 'q' || t.t === 'e') {
      $app.querySelectorAll('[data-i]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.dataset.i;
          A[t.id] = { idx: [i] };
          $app.querySelectorAll('[data-i]').forEach(function (x) {
            var on = x === b;
            x.classList.toggle('on', on);
            if (x.hasAttribute('aria-checked')) x.setAttribute('aria-checked', on);
            if (x.hasAttribute('aria-pressed')) x.setAttribute('aria-pressed', on);
          });
          salvar();
          track('resposta', { tela: t.id, opcao: i });
          setTimeout(avancar, 300);
        });
      });
    }

    if (t.t === 'm') {
      var ex = -1;
      t.o.forEach(function (o, i) { if (o.excl) ex = i; });
      $app.querySelectorAll('[data-i]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.dataset.i, atual = sel(A, t.id).slice();
          if (i === ex) atual = atual.indexOf(i) >= 0 ? [] : [i];
          else {
            atual = atual.filter(function (k) { return k !== ex; });
            var p = atual.indexOf(i);
            if (p >= 0) atual.splice(p, 1); else atual.push(i);
          }
          atual.sort(function (a, b) { return a - b; });
          A[t.id] = { idx: atual };
          if (!atual.length) delete A[t.id];
          $app.querySelectorAll('[data-i]').forEach(function (x) {
            var on = atual.indexOf(+x.dataset.i) >= 0;
            x.classList.toggle('on', on); x.setAttribute('aria-pressed', on);
          });
          seg.disabled = !atual.length;
          salvar();
        });
      });
      seg.addEventListener('click', function () { if (sel(A, t.id).length) { track('resposta', { tela: t.id, opcao: sel(A, t.id).join(',') }); avancar(); } });
    }

    if (t.t === 'ins' || t.t === 'antesdepois' || t.t === 'prova') {
      if (seg) seg.addEventListener('click', avancar);
    }

    if (t.t === 'diag') {
      track('diagnostico_visto', { codigo: calcular().travado }); /* só para o analytics: a tela não mostra o código */
      document.getElementById('segue').addEventListener('click', avancar);
      if (!S.diagVisto) {
        var nomes = ['PRÁTICA', 'SEMEAR', 'CRIAR RAIZ', 'NÃO DUVIDAR', 'POSICIONAMENTO', 'GESTAR', 'PERSEVERANÇA'], k = 0;
        var $c = document.getElementById('diag-cod');
        var iv = setInterval(function () { k = (k + 1) % nomes.length; $c.textContent = nomes[k]; }, 400);
        var to = setTimeout(function () {
          clearInterval(iv);
          S.diagVisto = true; salvar();
          document.getElementById('diag-load').hidden = true;
          var d = document.getElementById('diag'); d.hidden = false;
          var f = d.querySelector('[data-foco]'); if (f) f.focus({ preventScroll: true });
        }, 3000);
        limpeza = function () { clearInterval(iv); clearTimeout(to); };
      }
    }

    if (t.t === 'captura') ligarCaptura(t);

    if (t.t === 'resultado') ligarResultado();
  }

  /* Captura: 13 s fixos, não lineares, com o formulário liberado o tempo todo */
  function ligarCaptura(t) {
    var KF = [[0, 0], [1200, 14], [2000, 14], [4400, 36], [5200, 36], [8400, 66], [9200, 66], [11600, 88], [12300, 88], [13000, 100]];
    var t0 = performance.now(), pronto = false, raf;
    var $txt = document.getElementById('proc-txt'), $pct = document.getElementById('proc-pct'), $b = document.getElementById('proc-bar');
    var $form = document.getElementById('form'), $env = document.getElementById('enviar');
    function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
    function pct(ms) {
      for (var i = 0; i < KF.length - 1; i++) {
        if (ms <= KF[i + 1][0]) { var a = KF[i], b = KF[i + 1]; return a[1] + (b[1] - a[1]) * ease((ms - a[0]) / (b[0] - a[0])); }
      }
      return 100;
    }
    function passo(p) { var l = t.passos[0][1]; t.passos.forEach(function (s) { if (p >= s[0]) l = s[1]; }); return l; }
    function quadro(now) {
      var p = Math.floor(pct(now - t0));
      $b.style.width = p + '%'; $pct.textContent = p + '%'; $txt.textContent = passo(p);
      if (p >= 100) { pronto = true; document.querySelector('.proc').classList.add('ok'); atualizar(); return; }
      raf = requestAnimationFrame(quadro);
    }
    raf = requestAnimationFrame(quadro);
    limpeza = function () { cancelAnimationFrame(raf); };

    var $email = $form.querySelector('[name=email]'), $tel = $form.querySelector('[name=whatsapp]'), $sug = document.getElementById('sugestao-email');
    function valores() {
      var f = new FormData($form);
      return { nome: (f.get('nome') || '').trim(), email: (f.get('email') || '').trim(), whatsapp: f.get('whatsapp') || '' };
    }
    function erros(v) {
      var e = {};
      if (v.nome.replace(/[^A-Za-zÀ-ÿ]/g, '').length < 2) e.nome = 'Como posso chamar você?';
      var em = VALIDA.email(v.email);
      if (em.erro) e.email = em.erro;
      var wa = VALIDA.whatsapp(v.whatsapp);
      if (wa.erro) e.whatsapp = wa.erro;
      /* sugestão de correção do domínio (ex.: gmial.com → gmail.com) */
      if (em.sugestao) { $sug.hidden = false; $sug.textContent = 'Você quis dizer ' + em.sugestao + '? Toque para corrigir'; $sug.dataset.valor = em.sugestao; }
      else { $sug.hidden = true; }
      return e;
    }
    $sug.addEventListener('click', function () {
      $email.value = $sug.dataset.valor; tocados.email = true;
      $email.dispatchEvent(new Event('input', { bubbles: true }));
    });
    $tel.addEventListener('input', function () { $tel.value = VALIDA.mascara($tel.value); });
    function atualizar() { $env.disabled = !(pronto && !Object.keys(erros(valores())).length); }
    var tocados = {};
    $form.addEventListener('input', function (ev) {
      if (ev.target.name) tocados[ev.target.name] = true;
      var e = erros(valores());
      ['nome', 'email', 'whatsapp'].forEach(function (k) { document.getElementById('erro-' + k).textContent = tocados[k] && e[k] ? e[k] : ''; });
      atualizar();
    });
    $form.addEventListener('focusout', function (ev) {
      if (!ev.target.name) return;
      tocados[ev.target.name] = true;
      var e = erros(valores());
      document.getElementById('erro-' + ev.target.name).textContent = e[ev.target.name] || '';
    });
    var primeiro = true;
    $form.addEventListener('focusin', function () { if (primeiro) { primeiro = false; track('form_inicio'); } });
    $form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = valores(), e = erros(v);
      ['nome', 'email', 'whatsapp'].forEach(function (k) { document.getElementById('erro-' + k).textContent = e[k] || ''; });
      if (Object.keys(e).length || !pronto) return;
      var nome = v.nome.split(/\s+/)[0];
      S.lead = { nome: nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase(), email: VALIDA.email(v.email).ok, whatsapp: VALIDA.whatsapp(v.whatsapp).ok, capturado_em: new Date().toISOString() };
      salvar();
      calcular();
      track('lead', { codigo: R.travado });
      fbq('track', 'Lead', { content_name: 'Quiz Qual e a sua Sentenca' });
      enviarLead();
      avancar();
    });
    atualizar();
  }

  function ligarResultado() {
    track('resultado_visto', { codigo: R.travado });
    if (S.leadPendente) enviarLead();
    requestAnimationFrame(function () {
      $app.querySelectorAll('.trilho i').forEach(function (i) { i.style.width = i.dataset.w + '%'; });
    });
    $app.querySelectorAll('[data-checkout]').forEach(function (b) {
      b.addEventListener('click', function () { irCheckout(b.dataset.checkout); });
    });
    /* CTA fixo: sempre visível na página de vendas */
    $ctaFixo.innerHTML = '<div class="cta-in">' + botaoCheckout('cta-fixo', 'Quero destravar o meu código') + '</div>';
    $ctaFixo.querySelector('[data-checkout]').addEventListener('click', function () { irCheckout('cta-fixo'); });
    $ctaFixo.hidden = false;
    $app.querySelectorAll('[data-aula]').forEach(function (b) {
      b.addEventListener('click', function () {
        $app.querySelectorAll('[data-aula]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        document.getElementById('aula-desc').innerHTML = descAula(+b.dataset.aula);
        track('aula_vista', { aula: +b.dataset.aula + 1 });
      });
    });
    var imp = document.getElementById('impacto'), io = null;
    if (imp && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(function (ents) { if (ents[0].isIntersecting) { imp.classList.add('ver'); io.disconnect(); } }, { threshold: .35 });
      io.observe(imp);
    } else if (imp) imp.classList.add('ver');
    limpeza = function () { if (io) io.disconnect(); $ctaFixo.hidden = true; };
  }

  function irCheckout(origem) {
    track('checkout_click', { origem: origem, codigo: R && R.travado });
    fbq('track', 'InitiateCheckout', { value: 47, currency: 'BRL', content_name: 'Os 7 Codigos da Aprovacao' });
    var u = urlCheckout(origem);
    if (u) { window.location.href = u; return; }
    aviso('Checkout ainda não configurado (config.js → CHECKOUT_URL).');
  }

  function aviso(msg) {
    var d = document.createElement('div');
    d.className = 'aviso'; d.setAttribute('role', 'alert'); d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 3500);
  }

  /* ------------------------------ QA ------------------------------ */
  function painelQA() {
    var r = calcular();
    var p = document.getElementById('qa') || document.body.appendChild(Object.assign(document.createElement('pre'), { id: 'qa' }));
    p.textContent = 'tela: ' + TELAS[S.pos].id + '\n' + ORDEM_CANONICA.map(function (c) { return CODIGOS[c].nome + ': ' + r.scores[c]; }).join('\n') +
      '\ntravado: ' + r.travado + ' · forte: ' + r.forte + ' · 2º: ' + r.segundo + '\nlead: ' + leadScore().score;
  }
  window.__quiz = { estado: function () { return S; }, calcular: calcular, payload: payload, ir: function (id) { var i = idxDe(id); if (i >= 0) { S.pos = i; desenhar(); } } };

  /* ------------------------------ INÍCIO ------------------------------ */
  var pular = params.get('tela');
  if (pular && idxDe(pular) >= 0) S.pos = idxDe(pular);
  if (TELAS[S.pos] && TELAS[S.pos].t === 'resultado' && !S.lead) S.pos = idxDe('CAPTURA');
  if (!TELAS[S.pos] || !visivel(TELAS[S.pos])) S.pos = 0;
  desenhar();
})();
