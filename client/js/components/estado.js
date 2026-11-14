// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2[cite: 10]

// Troca o conteúdo do elemento por um estado de carregamento com spinner animado e acessibilidade.
export function mostrarCarregando(alvo, texto = 'Carregando...') {
  const caixa = document.createElement('div');
  caixa.className = 'estado estado--carregando';
  caixa.setAttribute('role', 'status');

  const giro = document.createElement('span');
  giro.className = 'estado__giro';
  giro.setAttribute('aria-hidden', 'true');

  const msg = document.createElement('p');
  msg.textContent = texto;

  caixa.append(giro, msg);
  alvo.replaceChildren(caixa);
}

// Exibe a mensagem de erro e, se aoTentarDeNovo for passada, adiciona o botão correspondente.
export function mostrarErro(alvo, mensagem, aoTentarDeNovo) {
  const caixa = document.createElement('div');
  caixa.className = 'estado estado--erro';

  const msg = document.createElement('p');
  msg.textContent = mensagem;
  caixa.append(msg);

  if (aoTentarDeNovo) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao';
    botao.textContent = 'Tentar de novo';
    botao.addEventListener('click', aoTentarDeNovo);
    caixa.append(botao);
  }

  alvo.replaceChildren(caixa);
}

// Exibe uma mensagem neutra para listas vazias, com suporte a uma ação opcional (botão/link).
export function mostrarVazio(alvo, mensagem, acao) {
  const caixa = document.createElement('div');
  caixa.className = 'estado estado--vazio';

  const msg = document.createElement('p');
  msg.textContent = mensagem;
  caixa.append(msg);

  if (acao && acao.texto && acao.callback) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao';
    botao.textContent = acao.texto;
    botao.addEventListener('click', acao.callback);
    caixa.append(botao);
  }

  alvo.replaceChildren(caixa);
}
