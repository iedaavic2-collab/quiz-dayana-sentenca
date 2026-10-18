/* ==========================================================================
   CONFIGURAÇÃO — preencher antes de publicar.
   Tudo o que está vazio fica desligado (o quiz funciona sem quebrar).
   ========================================================================== */
window.CONFIG = {
  /* Link do checkout (Green ou outra plataforma). As UTMs da visita são repassadas automaticamente. */
  CHECKOUT_URL: '',

  /* Webhook que recebe o lead (n8n, Make, CRM). POST em JSON. */
  WEBHOOK_URL: '',

  /* Meta Pixel (só o número). */
  META_PIXEL_ID: '',

  /* Oferta */
  PRECO: 'R$ 47,00',
  PARCELAS_TEXTO: 'ou parcelado no cartão (valor calculado pela plataforma)',

  /* Texto do FAQ "Como eu recebo?". Vazio = a pergunta não aparece. */
  COMO_RECEBE: '',

  /* Ex.: 'Acesso imediato'. Vazio = não aparece. Confirmar com a plataforma. */
  ACESSO_TEXTO: '',

  /* Rodapé */
  EMPRESA_RAZAO: '',
  EMPRESA_CNPJ: '',
  POLITICA_URL: '',
  TERMOS_URL: '',

  /* true = mostra caixas "FOTO: …" e "DEPOIMENTO 1 (aguardando)" onde ainda faltam arquivos.
     Deixar false na versão publicada: aí as fotos ausentes somem e a tela de depoimentos
     só aparece quando houver depoimentos em data.js. */
  MOSTRAR_ESPACOS_RESERVADOS: true
};
