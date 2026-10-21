// Responsável: M7 — veja a seção "M7 — Login e favoritos" no Guia da Entrega 1
import { desfavoritar, favoritar, listarFavoritos, usuarioAtual } from '../api.js';
import { mostrarToast } from './toast.js';
import { urlApp } from '../utils/rotas.js';

function ehFavorita(obraId) {
  if (!usuarioAtual()) return false;
  return listarFavoritos().some((obra) => obra.id === obraId);
}

export function criarBotaoFavorito(obraId) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-favorito';
  botao.setAttribute('aria-pressed', 'false');

  function atualizarEstado(favorito) {
    botao.textContent = favorito ? '♥' : '♡';
    botao.classList.toggle('favorito', favorito);
    botao.setAttribute('aria-pressed', String(favorito));
    botao.setAttribute('aria-label', favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    botao.title = favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
  }

  atualizarEstado(ehFavorita(obraId));

  botao.addEventListener('click', (evento) => {
    evento.preventDefault();

    if (!usuarioAtual()) {
      const voltar = encodeURIComponent(location.pathname + location.search + location.hash);
      location.href = `${urlApp('pages/login.html')}?voltar=${voltar}`;
      return;
    }

    const favorito = botao.getAttribute('aria-pressed') === 'true';
    try {
      if (favorito) desfavoritar(obraId);
      else favoritar(obraId);
      atualizarEstado(!favorito);
      mostrarToast(favorito ? 'Obra removida dos favoritos.' : 'Obra adicionada aos favoritos.');
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
    }
  });

  return botao;
}
