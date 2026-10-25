// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { mostrarToast } from '../components/toast.js';
import { criarCardObra } from '../components/card-obra.js';
import { listarExposicoes, listarObras, listarEventos } from '../api.js';
import { formatarData, formatarDataHora } from '../utils/datas.js';
import { urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function mensagemVazia(texto) {
  return criarElemento('p', 'em-construcao', texto);
}

// Banner da exposição atual
function desenharExposicao() {
  const alvo = document.getElementById('banner-exposicao');
  const [exposicao] = listarExposicoes({ status: 'atual' });
  if (!exposicao) {
    alvo.replaceChildren(mensagemVazia('Nenhuma exposição em cartaz no momento.'));
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
  alvo.replaceChildren(banner);
}

// 6 obras em destaque: as que estão em exibição
function desenharDestaques() {
  const alvo = document.getElementById('grid-destaques');
  const obras = listarObras({ ordem: 'recentes' })
    .dados.filter((obra) => obra.em_exibicao)
    .slice(0, 6);
  alvo.replaceChildren(
    ...(obras.length ? obras.map(criarCardObra) : [mensagemVazia('Nenhuma obra em exibição.')]),
  );
}

// 3 próximos eventos
function criarCardEvento(evento) {
  const card = criarElemento('article', 'card');
  const link = criarElemento('a', 'secao-link', 'Reservar ingressos →');
  link.href = urlApp(`pages/ingressos.html?evento=${evento.id}`);
  card.append(
    criarElemento('span', 'tag', evento.preco === 0 ? 'Gratuito' : formatoPreco.format(evento.preco)),
    criarElemento('h3', 'card-titulo', evento.titulo),
    criarElemento('p', 'card-texto', formatarDataHora(evento.data_hora)),
    criarElemento('p', 'card-texto', evento.descricao),
    evento.vagas_restantes === 0 ? criarElemento('p', 'card-texto', 'Esgotado') : link,
  );
  return card;
}

function desenharEventos() {
  const alvo = document.getElementById('grid-eventos');
  const eventos = listarEventos().slice(0, 3);
  alvo.replaceChildren(
    ...(eventos.length
      ? eventos.map(criarCardEvento)
      : [mensagemVazia('Não há eventos programados no momento.')]),
  );
}

for (const desenhar of [desenharExposicao, desenharDestaques, desenharEventos]) {
  try {
    desenhar();
  } catch (erro) {
    mostrarToast(erro.message, 'erro');
  }
}
