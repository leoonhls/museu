// Responsável: M5 — veja a seção "M5 — Exposições e eventos" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { listarExposicoes } from '../api.js';
import { formatarData } from '../utils/datas.js';

montarHeader();
montarFooter();

const statusValidos = ['atual', 'futura', 'passada'];
const abas = [...document.querySelectorAll('[role="tab"][data-status]')];
const lista = document.querySelector('#lista-exposicoes');

function criarCardExposicao(exposicao) {
  const card = document.createElement('article');
  card.className = 'card exposicao-card';

  const link = document.createElement('a');
  link.className = 'exposicao-card__link';
  link.href = `/pages/exposicao.html?id=${exposicao.id}`;

  const imagem = document.createElement('img');
  imagem.className = 'exposicao-card__imagem';
  imagem.src = exposicao.imagem_url;
  imagem.alt = '';
  imagem.loading = 'lazy';

  const titulo = document.createElement('h2');
  titulo.className = 'exposicao-card__titulo';
  titulo.textContent = exposicao.titulo;

  link.append(imagem, titulo);

  const descricao = document.createElement('p');
  descricao.textContent = exposicao.descricao;

  const datas = document.createElement('p');
  datas.className = 'exposicao-card__datas';
  datas.textContent = `${formatarData(exposicao.data_inicio)} – ${formatarData(exposicao.data_fim)}`;

  const sala = document.createElement('p');
  sala.className = 'exposicao-card__sala';
  sala.textContent = exposicao.sala;

  card.append(link, descricao, datas, sala);
  return card;
}

function selecionarStatus(status, atualizarUrl = false) {
  const statusSelecionado = statusValidos.includes(status) ? status : 'atual';
  const abaSelecionada = abas.find((aba) => aba.dataset.status === statusSelecionado);
  if (!lista || !abaSelecionada) return;

  for (const aba of abas) {
    const selecionada = aba === abaSelecionada;
    aba.setAttribute('aria-selected', String(selecionada));
    aba.tabIndex = selecionada ? 0 : -1;
  }
  lista.setAttribute('aria-labelledby', abaSelecionada.id);
  lista.replaceChildren();

  const exposicoes = listarExposicoes({ status: statusSelecionado });
  if (exposicoes.length === 0) {
    const mensagem = document.createElement('p');
    mensagem.className = 'exposicoes-vazio';
    mensagem.textContent = 'Não há exposições neste período.';
    lista.append(mensagem);
  } else {
    lista.append(...exposicoes.map(criarCardExposicao));
  }

  if (atualizarUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('status', statusSelecionado);
    window.history.pushState({}, '', url);
  }
}

for (const [indice, aba] of abas.entries()) {
  aba.addEventListener('click', () => selecionarStatus(aba.dataset.status, true));
  aba.addEventListener('keydown', (evento) => {
    let proximoIndice;
    if (evento.key === 'ArrowRight') proximoIndice = (indice + 1) % abas.length;
    if (evento.key === 'ArrowLeft') proximoIndice = (indice - 1 + abas.length) % abas.length;
    if (evento.key === 'Home') proximoIndice = 0;
    if (evento.key === 'End') proximoIndice = abas.length - 1;
    if (proximoIndice === undefined) return;

    evento.preventDefault();
    abas[proximoIndice].focus();
    selecionarStatus(abas[proximoIndice].dataset.status, true);
  });
}

window.addEventListener('popstate', () => {
  selecionarStatus(new URLSearchParams(window.location.search).get('status'));
});

selecionarStatus(new URLSearchParams(window.location.search).get('status'));
