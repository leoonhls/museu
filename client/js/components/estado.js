// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
// Estados de carregamento, erro e vazio usados por todas as páginas.
// Cada função troca todo o conteúdo de "alvo" por uma caixa .estado.

function criarCaixa(modificador, mensagem) {
  const caixa = document.createElement('div');
  caixa.className = `estado estado--${modificador}`;
  const texto = document.createElement('p');
  texto.textContent = mensagem;
  caixa.append(texto);
  return caixa;
}

function criarBotao(texto, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao';
  botao.textContent = texto;
  botao.addEventListener('click', aoClicar);
  return botao;
}

// Indicador animado com "Carregando…"; role="status" faz o leitor de tela anunciar.
export function mostrarCarregando(alvo, texto = 'Carregando…') {
  const caixa = criarCaixa('carregando', texto);
  caixa.setAttribute('role', 'status');
  const giro = document.createElement('span');
  giro.className = 'estado__giro';
  giro.setAttribute('aria-hidden', 'true');
  caixa.prepend(giro);
  alvo.replaceChildren(caixa);
}

// Mensagem de erro e, se aoTentarDeNovo for passada, um botão "Tentar de novo" que a chama.
export function mostrarErro(alvo, mensagem, aoTentarDeNovo) {
  const caixa = criarCaixa('erro', mensagem);
  caixa.setAttribute('role', 'alert');
  if (aoTentarDeNovo) caixa.append(criarBotao('Tentar de novo', aoTentarDeNovo));
  alvo.replaceChildren(caixa);
}

// Mensagem neutra para listas sem resultado. "acao" é opcional:
//   { texto: 'Limpar filtros', aoClicar: () => ... }  vira um botão
//   { texto: 'Ver exposições', href: '/pages/exposicoes.html' }  vira um link
export function mostrarVazio(alvo, mensagem, acao) {
  const caixa = criarCaixa('vazio', mensagem);
  if (acao?.href) {
    const link = document.createElement('a');
    link.className = 'botao';
    link.href = acao.href;
    link.textContent = acao.texto;
    caixa.append(link);
  } else if (acao?.aoClicar) {
    caixa.append(criarBotao(acao.texto, acao.aoClicar));
  }
  alvo.replaceChildren(caixa);
}
