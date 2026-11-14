// Responsável: M7 — veja a seção "M7 — Login e favoritos" no Guia da Entrega 1
import { desfavoritar, favoritar, listarFavoritos, usuarioAtual } from '../api.js';
import { mostrarToast } from './toast.js';
import { urlApp } from '../utils/rotas.js';

let favoritos = null;
let usuario = null;
let erroCarregamento = null;

function carregarFavoritos() {
  favoritos ??= usuarioAtual()
    .then((atual) => {
      usuario = atual;
      return atual ? listarFavoritos() : [];
    })
    .then((lista) => {
      erroCarregamento = null;
      return new Set(lista.map((obra) => obra.id));
    })
    .catch((erro) => {
      favoritos = null;
      erroCarregamento = erro;
      mostrarToast(erro.message, 'erro');
      return new Set();
    });
  return favoritos;
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

  carregarFavoritos().then((lista) => atualizarEstado(lista.has(obraId)));

  botao.addEventListener('click', async (evento) => {
    evento.preventDefault();

    botao.disabled = true;
    try {
      const lista = await carregarFavoritos();
      if (erroCarregamento) throw erroCarregamento;

      if (!usuario) {
        const voltar = encodeURIComponent(location.pathname + location.search + location.hash);
        location.href = `${urlApp('pages/login.html')}?voltar=${voltar}`;
        return;
      }

      const favorito = lista.has(obraId);
      if (favorito) await desfavoritar(obraId);
      else await favoritar(obraId);
      if (favorito) lista.delete(obraId);
      else lista.add(obraId);
      atualizarEstado(!favorito);
      mostrarToast(favorito ? 'Obra removida dos favoritos.' : 'Obra adicionada aos favoritos.');
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
    } finally {
      botao.disabled = false;
    }
  });

  return botao;
}
