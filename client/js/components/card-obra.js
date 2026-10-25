// Responsável: M3 — veja a seção "M3 — Galeria" no Guia da Entrega 1
import { criarBotaoFavorito } from './botao-favorito.js';
import { urlApp } from '../utils/rotas.js';

// obra: item de listarObras() (precisa de artista_nome)
export function criarCardObra(obra) {
  const card = document.createElement('article');
  card.className = 'card card-obra';

  const link = document.createElement('a');
  link.className = 'card-obra__link';
  link.href = urlApp(`pages/obra.html?id=${obra.id}`);

  const imagem = document.createElement('img');
  imagem.className = 'card-obra__imagem';
  imagem.src = urlApp(obra.imagem_url);
  imagem.alt = `${obra.titulo}, de ${obra.artista_nome}`;
  imagem.loading = 'lazy';

  const titulo = document.createElement('h3');
  titulo.className = 'card-obra__titulo';
  titulo.textContent = obra.titulo;

  const detalhes = document.createElement('p');
  detalhes.className = 'card-obra__detalhes';
  detalhes.textContent = `${obra.artista_nome} · ${obra.ano}`;

  link.append(imagem, titulo, detalhes);
  card.append(link, criarBotaoFavorito(obra.id));
  return card;
}
