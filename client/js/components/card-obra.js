// Responsável: M3 — veja a seção "M3 — Galeria" no Guia da Entrega 1
import { criarBotaoFavorito } from './botao-favorito.js';

// obra: item de listarObras() (precisa de artista_nome)
export function criarCardObra(obra) {
  const card = document.createElement('article');
  card.className = 'card';

  const link = document.createElement('a');
  link.href = `/pages/obra.html?id=${obra.id}`;

  const imagem = document.createElement('img');
  imagem.src = obra.imagem_url;
  imagem.alt = `${obra.titulo}, de ${obra.artista_nome}`;
  imagem.loading = 'lazy';

  const titulo = document.createElement('h3');
  titulo.textContent = obra.titulo;

  link.append(imagem, titulo);

  const detalhes = document.createElement('p');
  detalhes.textContent = `${obra.artista_nome} · ${obra.ano}`;

  card.append(link, detalhes, criarBotaoFavorito(obra.id));
  return card;
}
