// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
// TODO (M2):
// - banner da exposição atual
// - 6 obras em destaque com criarCardObra
// - 3 próximos eventos

import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { listarExposicoes, listarobras, listarEventos } from '../api.js';
import { criarCardObra } from '../components/card-obra.js';

montarHeader();
montarFooter();

// TODO (M2):
// - banner da exposição atual
try {
  const exposicoesAtuais = listarExposicoes({ status: 'atual' });
  const heroTitulo = document.querySelector('.hero-titulo');
  const heroDescricao = document.querySelector('.hero-descricao');

  if (exposicoesAtuais && exposicoesAtuais.length > 0 && heroTitulo && heroDescricao) {
    const exp = exposicoesAtuais[0];
    heroTitulo.textContent = exp.titulo;
    heroDescricao.textContent = exp.descricao;
  }
} catch (erro) {
  console.error('Erro ao carregar exposição atual:', erro);
}

// - 6 obras em destaque com criarCardObra
try {
  const respostaObras = listarobras();
  const gridDestaques = document.querySelector('#grid-destaques');

  if (gridDestaques && respostaObras && respostaObras.dados) {
    const obrasDestaque = respostaObras.dados.slice(0, 6);
    gridDestaques.replaceChildren(); // Limpa a grade antes de preencher

    for (const obra of obrasDestaque) {
      const card = criarCardObra(obra);
      gridDestaques.appendChild(card);
    }
  }
} catch (erro) {
  console.error('Erro ao carregar obras em destaque:', erro);
}

// - 3 próximos eventos
try {
  const eventos = listarEventos();
  const gridEventos = document.querySelector('#grid-eventos');

  if (gridEventos && eventos && eventos.length > 0) {
    const proximosEventos = eventos.slice(0, 3);

    gridEventos.innerHTML = proximosEventos
      .map(
        (ev) => `
      <article class="card">
        <span class="tag" style="width: fit-content; margin-bottom: var(--espaco-1)">${ev.preco === 0 ? 'Gratuito' : `R$ ${ev.preco.toFixed(2)}`}</span>
        <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">${ev.titulo}</h3>
        <p style="color: var(--cor-texto-suave); font-size: 0.9rem; margin-bottom: var(--espaco-2);">${ev.descricao}</p>
        <a href="pages/ingressos.html?evento=${ev.id}" style="color: var(--cor-destaque); text-decoration: none; font-weight: 500; font-size: 0.85rem; margin-top: auto;">Participar &rarr;</a>
      </article>
    `,
      )
      .join('');
  }
} catch (erro) {
  console.error('Erro ao carregar eventos:', erro);
}
