// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
// Versão mínima: o M2 completa o visual (giro animado, ícone de erro) mantendo as assinaturas.

// Troca o conteúdo do elemento por "Carregando…".
export function mostrarCarregando(alvo) {
  const mensagem = document.createElement('p');
  mensagem.setAttribute('role', 'status');
  mensagem.textContent = 'Carregando…';
  alvo.replaceChildren(mensagem);
}

// Mensagem de erro e, se aoTentarDeNovo for passada, um botão "Tentar de novo" que a chama.
export function mostrarErro(alvo, mensagem, aoTentarDeNovo) {
  const texto = document.createElement('p');
  texto.setAttribute('role', 'alert');
  texto.textContent = mensagem;
  const conteudo = [texto];
  if (aoTentarDeNovo) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao';
    botao.textContent = 'Tentar de novo';
    botao.addEventListener('click', aoTentarDeNovo);
    conteudo.push(botao);
  }
  alvo.replaceChildren(...conteudo);
}

// Mensagem neutra para listas sem resultado.
export function mostrarVazio(alvo, mensagem) {
  const texto = document.createElement('p');
  texto.textContent = mensagem;
  alvo.replaceChildren(texto);
}
