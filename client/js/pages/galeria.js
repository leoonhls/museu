// Responsável: M3 — veja a seção "M3 — Galeria" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { mostrarToast } from '../components/toast.js';
import { criarCardObra } from '../components/card-obra.js';
import { listarObras, listarCategorias, listarArtistas } from '../api.js';

montarHeader();
montarFooter();

const form = document.querySelector('#filtros');
const grid = document.querySelector('#grid-obras');
const contador = document.querySelector('#contador');
const paginacao = document.querySelector('#paginacao');
const botaoFiltrar = document.querySelector('.galeria__abrir-filtros');

// ---------------------------------------------------------------------------
// Selects preenchidos pelo api.js
// ---------------------------------------------------------------------------

function preencherSelect(select, itens, textoTodos) {
  select.append(new Option(textoTodos, ''));
  for (const item of itens) select.append(new Option(item.nome, item.id));
}

// ---------------------------------------------------------------------------
// Ler, pedir, desenhar
// ---------------------------------------------------------------------------

function lerFiltros() {
  const dados = Object.fromEntries(new FormData(form));
  // remove campos vazios para não poluir a URL
  return Object.fromEntries(Object.entries(dados).filter(([, v]) => v.trim() !== ''));
}

function atualizar(pagina = 1) {
  try {
    const filtros = { ...lerFiltros(), pagina };
    let resposta = listarObras(filtros);

    // página da URL maior que o total de páginas: vai para a última
    const totalPaginas = Math.ceil(resposta.total / resposta.porPagina);
    if (resposta.total > 0 && resposta.pagina > totalPaginas) {
      filtros.pagina = totalPaginas;
      resposta = listarObras(filtros);
    }

    history.replaceState(null, '', `?${new URLSearchParams(filtros)}`);
    desenharContador(resposta.total);
    desenharObras(resposta.dados);
    desenharPaginacao(resposta);
  } catch (erro) {
    mostrarToast(erro.message, 'erro');
  }
}

function desenharContador(total) {
  contador.textContent =
    total === 1 ? '1 obra encontrada' : `${total} obras encontradas`;
}

function desenharObras(obras) {
  if (obras.length === 0) {
    grid.replaceChildren(criarEstadoVazio());
    return;
  }
  grid.replaceChildren(...obras.map(criarCardObra));
}

function criarEstadoVazio() {
  const vazio = document.createElement('div');
  vazio.className = 'galeria__vazio';

  const mensagem = document.createElement('p');
  mensagem.textContent = 'Nenhuma obra encontrada.';

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao';
  botao.textContent = 'Limpar filtros';
  botao.addEventListener('click', limparFiltros);

  vazio.append(mensagem, botao);
  return vazio;
}

function criarBotaoPagina(texto, pagina, { desabilitado = false, atual = false } = {}) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao botao--secundario';
  botao.textContent = texto;
  botao.disabled = desabilitado;
  if (atual) {
    botao.classList.remove('botao--secundario');
    botao.setAttribute('aria-current', 'page');
  }
  botao.addEventListener('click', () => {
    atualizar(pagina);
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return botao;
}

function desenharPaginacao({ total, pagina, porPagina }) {
  const totalPaginas = Math.ceil(total / porPagina);
  if (totalPaginas <= 1) {
    paginacao.replaceChildren();
    return;
  }

  const botoes = [criarBotaoPagina('Anterior', pagina - 1, { desabilitado: pagina === 1 })];
  for (let numero = 1; numero <= totalPaginas; numero++) {
    const botao = criarBotaoPagina(String(numero), numero, { atual: numero === pagina });
    botao.setAttribute('aria-label', `Página ${numero}`);
    botoes.push(botao);
  }
  botoes.push(criarBotaoPagina('Próxima', pagina + 1, { desabilitado: pagina === totalPaginas }));

  paginacao.replaceChildren(...botoes);
}

function limparFiltros() {
  form.reset();
  atualizar(1);
}

// ---------------------------------------------------------------------------
// URL compartilhável: preenche o formulário antes da primeira busca
// ---------------------------------------------------------------------------

function preencherDaUrl() {
  const params = new URLSearchParams(location.search);
  for (const campo of form.elements) {
    if (campo.name && params.has(campo.name)) campo.value = params.get(campo.name);
  }
  return Number(params.get('pagina')) || 1;
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

let espera; // timer do debounce da busca

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // Enter na busca não recarrega a página
  clearTimeout(espera);
  atualizar(1);
});

form.addEventListener('change', (evento) => {
  if (evento.target === form.busca) return; // a busca usa o debounce abaixo
  atualizar(1);
});

form.busca.addEventListener('input', () => {
  clearTimeout(espera);
  espera = setTimeout(() => atualizar(1), 300);
});

document.querySelector('#limpar-filtros').addEventListener('click', limparFiltros);

// No celular os filtros ficam recolhidos atrás do botão "Filtrar"
botaoFiltrar.addEventListener('click', () => {
  const aberto = form.classList.toggle('galeria__filtros--aberto');
  botaoFiltrar.setAttribute('aria-expanded', aberto);
});

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

try {
  preencherSelect(form.categoria, listarCategorias(), 'Todas');
  preencherSelect(form.artista, listarArtistas(), 'Todos');
} catch (erro) {
  mostrarToast(erro.message, 'erro');
}
atualizar(preencherDaUrl());
