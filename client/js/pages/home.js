// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { criarCardObra } from '../components/card-obra.js';
import { mostrarCarregando, mostrarErro, mostrarVazio } from '../components/estado.js';
import { buscarDestaques } from '../api.js';
import { formatarData, formatarDataHora } from '../utils/datas.js';
import { urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const areaExposicao = document.getElementById('banner-exposicao');
const areaObras = document.getElementById('grid-destaques');
const areaEventos = document.getElementById('grid-eventos');

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

// Os estados ocupam a linha inteira das grids.
function areaDeEstado(grid) {
  const area = criarElemento('div', 'grid__estado');
  grid.replaceChildren(area);
  return area;
}

// Banner da exposição atual
function desenharExposicao(exposicao) {
  if (!exposicao) {
    mostrarVazio(areaExposicao, 'Nenhuma exposição em cartaz no momento.');
    return;
  }

  const banner = criarElemento('article', 'card banner-exposicao');
  const imagem = criarElemento('img', 'banner-exposicao__imagem');
  imagem.src = urlApp(exposicao.imagem_url);
  imagem.alt = '';

  const texto = criarElemento('div', 'banner-exposicao__texto');
  const link = criarElemento('a', 'botao', 'Conhecer a exposição');
  link.href = urlApp(`pages/exposicao.html?id=${exposicao.id}`);
  texto.append(
    criarElemento('span', 'tag', 'Em cartaz'),
    criarElemento('h3', 'banner-exposicao__titulo', exposicao.titulo),
    criarElemento('p', '', exposicao.descricao),
    criarElemento(
      'p',
      'banner-exposicao__datas',
      `${formatarData(exposicao.data_inicio)} – ${formatarData(exposicao.data_fim)} · ${exposicao.sala}`,
    ),
    link,
  );

  banner.append(imagem, texto);
  areaExposicao.replaceChildren(banner);
}

// 6 obras em destaque (o servidor prioriza as que estão em exibição)
function desenharObras(obras) {
  if (obras.length === 0) {
    mostrarVazio(areaDeEstado(areaObras), 'Nenhuma obra em exibição.');
    return;
  }
  areaObras.replaceChildren(...obras.map(criarCardObra));
}

// 3 próximos eventos
function criarCardEvento(evento) {
  const card = criarElemento('article', 'card');
  const link = criarElemento('a', 'secao-link', 'Reservar ingressos →');
  link.href = urlApp(`pages/ingressos.html?evento=${evento.id}`);
  card.append(
    criarElemento(
      'span',
      'tag',
      evento.preco === 0 ? 'Gratuito' : formatoPreco.format(evento.preco),
    ),
    criarElemento('h3', 'card-titulo', evento.titulo),
    criarElemento('p', 'card-texto', formatarDataHora(evento.data_hora)),
    criarElemento('p', 'card-texto', evento.descricao),
    evento.vagas_restantes === 0 ? criarElemento('p', 'card-texto', 'Esgotado') : link,
  );
  return card;
}

function desenharEventos(eventos) {
  if (eventos.length === 0) {
    mostrarVazio(areaDeEstado(areaEventos), 'Não há eventos programados no momento.');
    return;
  }
  areaEventos.replaceChildren(...eventos.map(criarCardEvento));
}

// Uma chamada só traz as três seções.
async function carregarHome() {
  mostrarCarregando(areaExposicao);
  mostrarCarregando(areaDeEstado(areaObras));
  mostrarCarregando(areaDeEstado(areaEventos));

  try {
    const { exposicao_atual, obras, eventos } = await buscarDestaques();
    desenharExposicao(exposicao_atual);
    desenharObras(obras);
    desenharEventos(eventos);
  } catch (erro) {
    // O botão só aparece na primeira seção, para não repetir três vezes.
    mostrarErro(areaExposicao, erro.message, carregarHome);
    areaObras.replaceChildren();
    areaEventos.replaceChildren();
  }
}

carregarHome();
