// Responsável: M7 — veja a seção "M7 — Login e favoritos" no Guia da Entrega 1
export function criarBotaoFavorito(obraId) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-favorito';
  botao.textContent = '♡';
  botao.setAttribute('aria-label', 'Favoritar obra');
  botao.disabled = true;
  botao.title = 'Em construção (M7)';
  return botao;
}
