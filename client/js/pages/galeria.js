// Responsável: M3 — veja a seção "M3" no Guia da Entrega 2
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { mostrarToast } from '../components/toast.js';
import { criarCardObra } from '../components/card-obra.js';
import { mostrarCarregando, mostrarErro, mostrarVazio } from '../components/estado.js';
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
// Estados (carregando, erro, vazio) ocupam a linha inteira da grid
// ---------------------------------------------------------------------------

function areaDeEstado() {
  const area = document.createElement('div');
  area.className = 'galeria__estado';
  grid.replaceChildren(area);
  return area;
}

// ---------------------------------------------------------------------------
// Ler, pedir, desenhar
// ---------------------------------------------------------------------------

function lerFiltros() {
  const dados = Object.fromEntries(new FormData(form));
  // remove campos vazios para não poluir a URL
  return Object.fromEntries(Object.entries(dados).filter(([, v]) => v.trim() !== ''));
}

// Cada pedido ganha um número. Se o usuário digita "mon" e depois "monet", a resposta de
// "mon" pode chegar DEPOIS da de "monet": comparando o número, a resposta atrasada é ignorada.
let ultimoPedido = 0;

// historico: 'novo' cria uma entrada (botão Voltar funciona), 'substituir' troca a atual
// e 'nenhum' não mexe na URL (usado ao navegar pelo histórico).
async function atualizar(pagina = 1, historico = 'novo') {
  const pedido = ++ultimoPedido;
  const filtros = { ...lerFiltros(), pagina };

  // A URL muda na hora, antes da resposta: copiar e abrir em outra aba mostra o mesmo resultado.
  atualizarUrl(filtros, historico);
  contador.textContent = '';
  paginacao.replaceChildren();
  grid.setAttribute('aria-busy', 'true');
  mostrarCarregando(areaDeEstado());

  try {
    let resposta = await listarObras(filtros);
    if (pedido !== ultimoPedido) return; // chegou atrasada: ignore

    // página da URL maior que o total de páginas: vai para a última
    const totalPaginas = Math.ceil(resposta.total / resposta.porPagina);
    if (resposta.total > 0 && resposta.pagina > totalPaginas) {
      filtros.pagina = totalPaginas;
      resposta = await listarObras(filtros);
      if (pedido !== ultimoPedido) return;
      atualizarUrl(filtros, 'substituir');
    }

    desenharContador(resposta.total);
    desenharObras(resposta.dados);
    desenharPaginacao(resposta);
  } catch (erro) {
    if (pedido === ultimoPedido) {
      mostrarErro(areaDeEstado(), erro.message, () => atualizar(pagina, 'nenhum'));
    }
  } finally {
    if (pedido === ultimoPedido) grid.removeAttribute('aria-busy');
  }
}

function atualizarUrl(filtros, historico) {
  const url = `?${new URLSearchParams(filtros)}`;
  if (historico === 'novo' && url !== location.search) history.pushState(null, '', url);
  if (historico === 'substituir') history.replaceState(null, '', url);
}

function desenharContador(total) {
  contador.textContent =
    total === 1 ? '1 obra encontrada' : `${total} obras encontradas`;
}

function desenharObras(obras) {
  if (obras.length === 0) {
    const area = areaDeEstado();
    mostrarVazio(area, 'Nenhuma obra encontrada.');
    area.append(criarBotaoLimpar());
    return;
  }
  grid.replaceChildren(...obras.map(criarCardObra));
}

function criarBotaoLimpar() {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao';
  botao.textContent = 'Limpar filtros';
  botao.addEventListener('click', limparFiltros);
  return botao;
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
  clearTimeout(espera);
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
  espera = setTimeout(() => atualizar(1, 'substituir'), 300);
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

// Os selects precisam das opções ANTES de preencherDaUrl, senão o valor da URL não "pega".
mostrarCarregando(areaDeEstado());
try {
  const [categorias, artistas] = await Promise.all([listarCategorias(), listarArtistas()]);
  preencherSelect(form.categoria, categorias, 'Todas');
  preencherSelect(form.artista, artistas, 'Todos');
} catch (erro) {
  // sem as listas, os filtros de categoria e artista ficam só com "Todas/Todos"
  preencherSelect(form.categoria, [], 'Todas');
  preencherSelect(form.artista, [], 'Todos');
  mostrarToast(`Não foi possível carregar os filtros: ${erro.message}`, 'erro');
}
atualizar(preencherDaUrl(), 'substituir');

window.addEventListener('popstate', () => {
  form.reset();
  atualizar(preencherDaUrl(), 'nenhum');
});
