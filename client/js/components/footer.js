// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1

export function montarFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  const conteudo = document.createElement('div');
  conteudo.className = 'container';

  const projeto = document.createElement('p');
  projeto.style.fontWeight = '600';
  projeto.style.color = 'var(--cor-texto)';
  projeto.textContent = ' Projeto acadêmico';

  const alvo = document.getElementById('footer');
  if (alvo) {
    alvo.replaceChildren(footer);
  }
}
