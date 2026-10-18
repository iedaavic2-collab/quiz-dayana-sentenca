/* ==========================================================================
   Validação de e-mail e WhatsApp da captura
   - Barra formatos inválidos, números e e-mails de teste e e-mails descartáveis.
   - Sugere correção para erros de digitação no domínio (ex.: gmial.com → gmail.com).
   Limite: no navegador não dá para confirmar que o e-mail ou o WhatsApp existem de fato.
   Para isso, ver "Verificação real" no LEIA-ME (código de confirmação ou serviço de verificação).
   ========================================================================== */
window.VALIDA = (function () {
  'use strict';

  /* DDDs válidos no Brasil (Anatel) */
  var DDDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99];

  /* Provedores de e-mail temporário/descartável */
  var DESCARTAVEIS = ['mailinator.com', 'yopmail.com', '10minutemail.com', 'guerrillamail.com', 'guerrillamail.net',
    'sharklasers.com', 'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tempail.com', 'tempmailo.com', 'mytemp.email',
    'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'mohmal.com', 'throwawaymail.com', 'fakeinbox.com',
    'emailondeck.com', 'mintemail.com', 'burnermail.io', 'moakt.com', 'inboxkitten.com', 'mailnesia.com',
    'spamgourmet.com', '1secmail.com', 'emailfake.com', 'fakemail.net', 'mailcatch.com', 'discard.email'];

  /* Domínios e nomes que indicam e-mail de teste */
  var DOMINIOS_TESTE = ['exemplo.com', 'exemplo.com.br', 'example.com', 'example.org', 'teste.com', 'teste.com.br',
    'test.com', 'testes.com', 'email.teste', 'fake.com', 'asdf.com', 'aaa.com', 'abc.com', 'xxx.com', 'qwerty.com'];
  var NOMES_TESTE = ['teste', 'testes', 'test', 'testando', 'asdf', 'qwerty', 'abc', 'abcd', 'aaa', 'aaaa', 'xxx',
    'xxxx', 'nada', 'nenhum', 'naotenho', 'sememail', 'fake', 'fulano', 'ciclano', 'beltrano', 'exemplo', 'seuemail',
    'meuemail', 'email', 'nome', 'usuario', 'user', 'a', 'x'];

  /* Domínios mais usados no Brasil, para sugerir correção de digitação */
  var COMUNS = ['gmail.com', 'hotmail.com', 'outlook.com', 'outlook.com.br', 'yahoo.com', 'yahoo.com.br', 'icloud.com',
    'live.com', 'msn.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'hotmail.com.br', 'globo.com', 'ig.com.br'];
  var FIXOS = { 'gmail.com.br': 'gmail.com', 'gmail.co': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com',
    'hotmail.co': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'outlok.com': 'outlook.com' };

  function distancia(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[m][n];
  }

  function sugerirDominio(dom) {
    if (COMUNS.indexOf(dom) >= 0) return null;
    if (FIXOS[dom]) return FIXOS[dom];
    var melhor = null, menor = 3;
    COMUNS.forEach(function (c) { var x = distancia(dom, c); if (x < menor) { menor = x; melhor = c; } });
    return menor <= 2 ? melhor : null;
  }

  function email(valor) {
    var v = String(valor || '').trim().toLowerCase();
    if (!v) return { erro: 'Digite o seu e-mail.' };
    var ok = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(v);
    if (!ok || v.indexOf('..') >= 0) return { erro: 'Confira o e-mail. Parece que falta alguma coisa.' };
    var partes = v.split('@'), nome = partes[0], dom = partes[1];
    if (DESCARTAVEIS.indexOf(dom) >= 0) return { erro: 'Use um e-mail pessoal. E-mails temporários não recebem o seu mapa.' };
    if (DOMINIOS_TESTE.indexOf(dom) >= 0 || NOMES_TESTE.indexOf(nome) >= 0 || /^(.)\1{3,}$/.test(nome) || /^\d{1,6}$/.test(nome)) {
      return { erro: 'Esse e-mail parece de teste. Use o seu e-mail de verdade: é por ele que você recebe o acesso.' };
    }
    var sug = sugerirDominio(dom);
    if (sug) return { erro: 'Confira o final do e-mail.', sugestao: nome + '@' + sug };
    return { ok: v };
  }

  function soDigitos(valor) {
    var d = String(valor || '').replace(/\D/g, '');
    if (/^55\d{11}$/.test(d)) d = d.slice(2);
    if (/^0\d{11}$/.test(d)) d = d.slice(1);
    return d;
  }

  function sequencia(s, n) {
    var sobe = 1, desce = 1;
    for (var i = 1; i < s.length; i++) {
      var dif = s.charCodeAt(i) - s.charCodeAt(i - 1);
      sobe = dif === 1 ? sobe + 1 : 1;
      desce = dif === -1 ? desce + 1 : 1;
      if (sobe >= n || desce >= n) return true;
    }
    return false;
  }

  function whatsapp(valor) {
    var d = soDigitos(valor);
    if (!d) return { erro: 'Digite o seu WhatsApp com DDD.' };
    if (d.length < 11) {
      if (d.length === 10 && d[2] !== '9') return { erro: 'Esse parece um número fixo. Use o seu WhatsApp (celular com 9 dígitos).' };
      return { erro: 'Faltam números. O WhatsApp tem DDD + 9 dígitos.' };
    }
    if (d.length > 11) return { erro: 'Sobraram números. O WhatsApp tem DDD + 9 dígitos.' };
    if (DDDS.indexOf(+d.slice(0, 2)) < 0) return { erro: 'Esse DDD não existe. Confira os dois primeiros números.' };
    if (d[2] !== '9') return { erro: 'Celulares começam com 9 depois do DDD. Confira o número.' };
    var assinante = d.slice(3); /* 8 dígitos depois do 9 */
    var freq = {}, maior = 0;
    for (var i = 0; i < assinante.length; i++) { freq[assinante[i]] = (freq[assinante[i]] || 0) + 1; maior = Math.max(maior, freq[assinante[i]]); }
    if (maior >= 7 || sequencia(d.slice(2), 7)) {
      return { erro: 'Esse número parece de teste. Use o seu WhatsApp de verdade: é por ele que você recebe o seu mapa.' };
    }
    return { ok: '55' + d };
  }

  /* Máscara (62) 99999-9999 enquanto a pessoa digita */
  function mascara(valor) {
    var d = String(valor || '').replace(/\D/g, '');
    if (/^55\d{11,}$/.test(d)) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  return { email: email, whatsapp: whatsapp, mascara: mascara };
})();
