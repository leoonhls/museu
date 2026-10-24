// Responsável: M5 — veja a seção "M5 — Exposições e eventos" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { listarEventos } from '../api.js';
import { formatarDataHora } from '../utils/datas.js';
import { urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const agenda = document.querySelector('#agenda-eventos');
const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function criarCardEvento(evento) {
  const card = document.createElement('article');
  card.className = 'card evento-card';

  const imagem = document.createElement('img');
  imagem.className = 'evento-card__imagem';
  imagem.src = urlApp(evento.imagem_url);
  imagem.alt = '';
  imagem.loading = 'lazy';

  const titulo = document.createElement('h3');
  titulo.className = 'evento-card__titulo';
  titulo.textContent = evento.titulo;

  const descricao = document.createElement('p');
  descricao.textContent = evento.descricao;

  const data = document.createElement('p');
  data.className = 'evento-card__data';
  data.textContent = formatarDataHora(evento.data_hora);

  const vagas = document.createElement('p');
  vagas.className = 'evento-card__vagas';
  vagas.textContent =
    evento.vagas_restantes === 0
      ? 'Esgotado'
      : `${evento.vagas_restantes} ${evento.vagas_restantes === 1 ? 'vaga restante' : 'vagas restantes'}`;

  const preco = document.createElement('p');
  preco.className = 'evento-card__preco';
  preco.textContent = evento.preco === 0 ? 'Gratuito' : formatoPreco.format(evento.preco);

  const acao =
    evento.vagas_restantes === 0
      ? document.createElement('button')
      : document.createElement('a');
  acao.className = 'botao evento-card__acao';
  if (evento.vagas_restantes === 0) {
    acao.type = 'button';
    acao.disabled = true;
    acao.textContent = 'Esgotado';
  } else {
    acao.href = urlApp(`pages/ingressos.html?evento=${encodeURIComponent(evento.id)}`);
    acao.textContent = 'Reservar ingressos';
  }

  card.append(imagem, titulo, descricao, data, vagas, preco, acao);
  return card;
}

function renderizarAgenda() {
  if (!agenda) return;

  const eventos = listarEventos();
  if (eventos.length === 0) {
    const mensagem = document.createElement('p');
    mensagem.className = 'agenda-eventos__vazia';
    mensagem.textContent = 'Não há eventos programados no momento.';
    agenda.replaceChildren(mensagem);
    return;
  }

  const grupos = new Map();
  for (const evento of eventos) {
    const mes = formatoMes.format(new Date(evento.data_hora));
    if (!grupos.has(mes)) grupos.set(mes, []);
    grupos.get(mes).push(evento);
  }

  const fragmento = document.createDocumentFragment();
  for (const [mes, eventosDoMes] of grupos) {
    const grupo = document.createElement('section');
    grupo.className = 'agenda-eventos__mes';

    const tituloMes = document.createElement('h2');
    tituloMes.className = 'agenda-eventos__titulo';
    tituloMes.textContent = mes.charAt(0).toLocaleUpperCase('pt-BR') + mes.slice(1);

    const lista = document.createElement('div');
    lista.className = 'grid agenda-eventos__lista';
    lista.append(...eventosDoMes.map(criarCardEvento));

    grupo.append(tituloMes, lista);
    fragmento.append(grupo);
  }

  agenda.replaceChildren(fragmento);
}

renderizarAgenda();
