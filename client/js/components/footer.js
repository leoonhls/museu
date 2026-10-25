// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
export function montarFooter() {
  const alvo = document.getElementById('footer');
  if (!alvo) return;

  const footer = document.createElement('footer');
  footer.className = 'footer';

  const conteudo = document.createElement('div');
  conteudo.className = 'container footer__conteudo';

  const sobre = document.createElement('div');
  const nome = document.createElement('p');
  nome.className = 'footer__nome';
  nome.textContent = 'Museu de Artes';
  const lema = document.createElement('p');
  lema.textContent = 'Preservando a expressão, a história e a cultura.';
  sobre.append(nome, lema);

  const info = document.createElement('div');
  const horario = document.createElement('p');
  horario.textContent = 'Terça a domingo, 10h–18h';
  const projeto = document.createElement('p');
  projeto.textContent = 'Projeto acadêmico · 2026';
  info.append(horario, projeto);

  conteudo.append(sobre, info);
  footer.append(conteudo);
  alvo.replaceChildren(footer);
}
