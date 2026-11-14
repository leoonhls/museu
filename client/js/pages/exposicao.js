import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { buscarExposicao } from '../api.js';
import { mostrarCarregando, mostrarErro, mostrarVazio } from '../components/estado.js';
import { criarCardObra } from '../components/card-obra.js';
import { formatarData, formatarDataHora } from '../utils/datas.js';
import { urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const detalhe = document.querySelector('#detalhe-exposicao');
const id = new URLSearchParams(window.location.search).get('id');

function criarTitulo(texto) {
  const titulo = document.createElement('h1');
  titulo.textContent = texto;
  return titulo;
}

function criarMensagem(texto) {
  const mensagem = document.createElement('p');
  mensagem.className = 'em-construcao';
  mensagem.textContent = texto;
  return mensagem;
}

function criarSecao(tituloTexto, itens, criarItem, mensagemVazia) {
  const secao = document.createElement('section');
  secao.className = 'detalhe-exposicao__secao';

  const titulo = document.createElement('h2');
  titulo.textContent = tituloTexto;
  secao.append(titulo);

  if (itens.length === 0) {
    const vazio = document.createElement('div');
    mostrarVazio(vazio, mensagemVazia);
    secao.append(vazio);
    return secao;
  }

  const lista = document.createElement('div');
  lista.className = 'grid';
  lista.append(...itens.map(criarItem));
  secao.append(lista);
  return secao;
}

function criarCardEvento(evento) {
  const card = document.createElement('article');
  card.className = 'card detalhe-evento';

  const titulo = document.createElement('h3');
  titulo.textContent = evento.titulo;

  const descricao = document.createElement('p');
  descricao.textContent = evento.descricao;

  const data = document.createElement('p');
  data.className = 'detalhe-evento__data';
  data.textContent = formatarDataHora(evento.data_hora);

  const link = document.createElement('a');
  link.className = 'botao';
  link.href = urlApp(`pages/ingressos.html?evento=${encodeURIComponent(evento.id)}`);
  link.textContent = 'Ingressos';

  card.append(titulo, descricao, data, link);
  return card;
}

function renderizarExposicao(exposicao) {
  if (!detalhe) return;
  if (!exposicao) {
    document.title = 'Exposição não encontrada — Museu';
    detalhe.replaceChildren(
      criarTitulo('Exposição não encontrada'),
    );
    const vazio = document.createElement('div');
    mostrarVazio(vazio, 'Confira o link ou veja todas as exposições.');
    detalhe.append(vazio);
    return;
  }

  document.title = `${exposicao.titulo} — Museu`;

  const banner = document.createElement('article');
  banner.className = 'exposicao-banner';

  const imagem = document.createElement('img');
  imagem.className = 'exposicao-banner__imagem';
  imagem.src = urlApp(exposicao.imagem_url);
  imagem.alt = '';

  const conteudo = document.createElement('div');
  conteudo.className = 'exposicao-banner__conteudo';

  const titulo = document.createElement('h1');
  titulo.textContent = exposicao.titulo;

  const status = document.createElement('p');
  status.className = `tag exposicao-status exposicao-status--${exposicao.status}`;
  status.textContent = {
    atual: 'Em cartaz',
    futura: 'Em breve',
    passada: 'Encerrada',
  }[exposicao.status];

  const descricao = document.createElement('p');
  descricao.textContent = exposicao.descricao;

  const datas = document.createElement('p');
  datas.className = 'exposicao-banner__datas';
  datas.textContent = `${formatarData(exposicao.data_inicio)} – ${formatarData(exposicao.data_fim)}`;

  const sala = document.createElement('p');
  sala.className = 'exposicao-banner__sala';
  sala.textContent = exposicao.sala;

  conteudo.append(titulo, status, descricao, datas, sala);
  banner.append(imagem, conteudo);

  detalhe.replaceChildren(
    banner,
    criarSecao('Obras em exposição', exposicao.obras, criarCardObra, 'Não há obras disponíveis para esta exposição.'),
    criarSecao('Eventos relacionados', exposicao.eventos, criarCardEvento, 'Não há eventos relacionados a esta exposição.'),
  );
}

async function carregarExposicao() {
  if (!detalhe) return;
  mostrarCarregando(detalhe);
  if (!id || !/^\d+$/.test(id)) {
    renderizarExposicao(null);
    return;
  }

  try {
    const exposicao = await buscarExposicao(id);
    renderizarExposicao(exposicao);
  } catch (erro) {
    console.error('Erro ao carregar exposição:', erro);
    document.title = 'Erro ao carregar exposição — Museu';
    mostrarErro(
      detalhe,
      erro.message || 'Não foi possível carregar esta exposição. Tente novamente.',
      carregarExposicao,
    );
    detalhe.querySelector('[role="alert"]').classList.add('exposicao-erro');
  }
}

carregarExposicao();
