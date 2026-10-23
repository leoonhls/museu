// Responsável: M4 — veja a seção "M4 — Obra, artista e dados reais" no Guia da Entrega 1
import { buscarObra, listarObras } from '../api.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { criarBotaoFavorito } from '../components/botao-favorito.js';
import { criarCardObra } from '../components/card-obra.js';
import { mostrarToast } from '../components/toast.js';
import { urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const container = document.querySelector('#conteudo-obra');

function renderizarNaoEncontrada(mensagem = 'Obra não encontrada') {
  document.title = 'Obra não encontrada — Museu';

  const secao = document.createElement('section');
  secao.className = 'card obra-vazio';

  const titulo = document.createElement('h1');
  titulo.textContent = mensagem;

  const texto = document.createElement('p');
  texto.textContent =
    'A obra que você tentou acessar não existe ou foi removida do catálogo do museu.';

  const linkVoltar = document.createElement('a');
  linkVoltar.href = urlApp('pages/obras.html');
  linkVoltar.className = 'botao';
  linkVoltar.textContent = 'Voltar ao acervo';

  secao.append(titulo, texto, linkVoltar);
  container.replaceChildren(secao);
}

function adicionarItemFicha(dl, rotulo, valorOuElemento) {
  const item = document.createElement('div');
  item.className = 'obra-ficha__item';

  const dt = document.createElement('dt');
  dt.textContent = rotulo;

  const dd = document.createElement('dd');
  if (typeof valorOuElemento === 'string' || typeof valorOuElemento === 'number') {
    dd.textContent = String(valorOuElemento);
  } else if (valorOuElemento instanceof Node) {
    dd.append(valorOuElemento);
  }

  item.append(dt, dd);
  dl.append(item);
}

function criarDialogImagem(obra, textoAlt) {
  const dialog = document.createElement('dialog');
  dialog.className = 'obra-modal';
  dialog.setAttribute('aria-label', `Visualização ampliada de ${obra.titulo}`);

  const conteudoModal = document.createElement('div');
  conteudoModal.className = 'obra-modal__conteudo';

  const botaoFechar = document.createElement('button');
  botaoFechar.type = 'button';
  botaoFechar.className = 'botao obra-modal__fechar';
  botaoFechar.setAttribute('aria-label', 'Fechar imagem ampliada');
  botaoFechar.textContent = 'Fechar ✕';
  botaoFechar.addEventListener('click', () => dialog.close());

  const imagemAmpliada = document.createElement('img');
  imagemAmpliada.className = 'obra-modal__imagem';
  imagemAmpliada.src = urlApp(obra.imagem_url);
  imagemAmpliada.alt = textoAlt;

  const legenda = document.createElement('p');
  legenda.className = 'obra-modal__legenda';
  legenda.textContent = `${obra.titulo} (${obra.ano}) — ${obra.artista_nome}`;

  conteudoModal.append(botaoFechar, imagemAmpliada, legenda);
  dialog.append(conteudoModal);

  dialog.addEventListener('click', (evento) => {
    if (evento.target === dialog) {
      dialog.close();
    }
  });

  return dialog;
}

function renderizarObra(obra, maisObras) {
  document.title = `${obra.titulo} — Museu`;
  const nomeArtista = obra.artista?.nome ?? obra.artista_nome ?? 'Artista desconhecido';
  const textoAlt = `${obra.titulo}, de ${nomeArtista}`;

  const trilha = document.createElement('nav');
  trilha.className = 'obra-trilha';
  trilha.setAttribute('aria-label', 'Navegação estrutural');

  const linkAcervo = document.createElement('a');
  linkAcervo.href = urlApp('pages/obras.html');
  linkAcervo.textContent = '← Voltar ao acervo';
  trilha.append(linkAcervo);

  const artigo = document.createElement('article');
  artigo.className = 'obra-detalhe';

  const dialog = criarDialogImagem(obra, textoAlt);

  const colunaMidia = document.createElement('div');
  colunaMidia.className = 'obra-midia';

  const botaoAmpliar = document.createElement('button');
  botaoAmpliar.type = 'button';
  botaoAmpliar.className = 'obra-midia__gatilho';
  botaoAmpliar.setAttribute('aria-label', `Ampliar imagem da obra ${obra.titulo}`);

  const imagem = document.createElement('img');
  imagem.className = 'obra-midia__imagem';
  imagem.src = urlApp(obra.imagem_url);
  imagem.alt = textoAlt;

  const dicaZoom = document.createElement('span');
  dicaZoom.className = 'obra-midia__dica';
  dicaZoom.textContent = 'Clique na imagem para ampliar';

  botaoAmpliar.append(imagem, dicaZoom);
  botaoAmpliar.addEventListener('click', () => {
    dialog.showModal();
  });

  colunaMidia.append(botaoAmpliar);

  const colunaInfo = document.createElement('div');
  colunaInfo.className = 'obra-info';

  const cabecalho = document.createElement('header');
  cabecalho.className = 'obra-info__cabecalho';

  const linhaTopo = document.createElement('div');
  linhaTopo.className = 'obra-info__topo';

  const etiquetas = document.createElement('div');
  etiquetas.className = 'obra-info__etiquetas';

  if (obra.categoria_nome) {
    const tagCategoria = document.createElement('span');
    tagCategoria.className = 'tag';
    tagCategoria.textContent = obra.categoria_nome;
    etiquetas.append(tagCategoria);
  }

  if (obra.em_exibicao) {
    const seloExibicao = document.createElement('span');
    seloExibicao.className = 'tag obra-info__selo-exibicao';
    seloExibicao.textContent = 'Em exibição';
    etiquetas.append(seloExibicao);
  }

  const botaoFavorito = criarBotaoFavorito(obra.id);
  linhaTopo.append(etiquetas, botaoFavorito);

  const titulo = document.createElement('h1');
  titulo.className = 'obra-info__titulo';
  titulo.textContent = obra.titulo;

  const subtituloArtista = document.createElement('p');
  subtituloArtista.className = 'obra-info__subtitulo';

  const linkArtistaTopo = document.createElement('a');
  linkArtistaTopo.href = urlApp(`pages/artista.html?id=${obra.artista_id}`);
  linkArtistaTopo.className = 'obra-info__link-artista';
  linkArtistaTopo.textContent = nomeArtista;

  subtituloArtista.append(linkArtistaTopo, ` · ${obra.ano}`);
  cabecalho.append(linhaTopo, titulo, subtituloArtista);

  const descricao = document.createElement('p');
  descricao.className = 'obra-info__descricao';
  descricao.textContent = obra.descricao;

  const secaoFicha = document.createElement('section');
  secaoFicha.className = 'obra-ficha';
  secaoFicha.setAttribute('aria-labelledby', 'titulo-ficha-tecnica');

  const tituloFicha = document.createElement('h2');
  tituloFicha.id = 'titulo-ficha-tecnica';
  tituloFicha.className = 'obra-ficha__titulo';
  tituloFicha.textContent = 'Ficha técnica';

  const dl = document.createElement('dl');
  dl.className = 'obra-ficha__lista';

  const linkArtistaFicha = document.createElement('a');
  linkArtistaFicha.href = urlApp(`pages/artista.html?id=${obra.artista_id}`);
  linkArtistaFicha.textContent = nomeArtista;

  adicionarItemFicha(dl, 'Artista', linkArtistaFicha);
  adicionarItemFicha(dl, 'Ano', obra.ano);
  adicionarItemFicha(dl, 'Técnica', obra.tecnica);
  adicionarItemFicha(dl, 'Dimensões', obra.dimensoes || 'Não informadas');
  adicionarItemFicha(dl, 'Categoria', obra.categoria?.nome ?? obra.categoria_nome ?? '—');

  secaoFicha.append(tituloFicha, dl);

  const secaoExposicoes = document.createElement('section');
  secaoExposicoes.className = 'obra-exposicoes';
  secaoExposicoes.setAttribute('aria-labelledby', 'titulo-exposicoes-obra');

  const tituloExposicoes = document.createElement('h2');
  tituloExposicoes.id = 'titulo-exposicoes-obra';
  tituloExposicoes.className = 'obra-exposicoes__titulo';
  tituloExposicoes.textContent = 'Faz parte das exposições';

  secaoExposicoes.append(tituloExposicoes);

  if (Array.isArray(obra.exposicoes) && obra.exposicoes.length > 0) {
    const listaExposicoes = document.createElement('ul');
    listaExposicoes.className = 'obra-exposicoes__lista';

    for (const exposicao of obra.exposicoes) {
      const li = document.createElement('li');
      li.className = 'obra-exposicoes__item';

      const linkExposicao = document.createElement('a');
      linkExposicao.href = urlApp(`pages/exposicao.html?id=${exposicao.id}`);
      linkExposicao.className = 'obra-exposicoes__link';
      linkExposicao.textContent = exposicao.titulo;

      li.append(linkExposicao);

      if (exposicao.sala) {
        const sala = document.createElement('span');
        sala.className = 'obra-exposicoes__sala';
        sala.textContent = ` · ${exposicao.sala}`;
        li.append(sala);
      }

      listaExposicoes.append(li);
    }

    secaoExposicoes.append(listaExposicoes);
  } else {
    const semExposicoes = document.createElement('p');
    semExposicoes.className = 'obra-exposicoes__vazio';
    semExposicoes.textContent = 'Esta obra não integra exposições programadas no momento.';
    secaoExposicoes.append(semExposicoes);
  }

  colunaInfo.append(cabecalho, descricao, secaoFicha, secaoExposicoes);
  artigo.append(colunaMidia, colunaInfo);

  const secaoRelacionadas = document.createElement('section');
  secaoRelacionadas.className = 'obra-relacionadas';
  secaoRelacionadas.setAttribute('aria-labelledby', 'titulo-mais-obras');

  const cabecalhoRelacionadas = document.createElement('div');
  cabecalhoRelacionadas.className = 'obra-relacionadas__cabecalho';

  const tituloRelacionadas = document.createElement('h2');
  tituloRelacionadas.id = 'titulo-mais-obras';
  tituloRelacionadas.textContent = 'Mais obras deste artista';

  const linkVerArtista = document.createElement('a');
  linkVerArtista.href = urlApp(`pages/artista.html?id=${obra.artista_id}`);
  linkVerArtista.className = 'botao botao--secundario';
  linkVerArtista.textContent = `Ver perfil de ${nomeArtista}`;

  cabecalhoRelacionadas.append(tituloRelacionadas, linkVerArtista);
  secaoRelacionadas.append(cabecalhoRelacionadas);

  if (maisObras.length > 0) {
    const gradeRelacionadas = document.createElement('div');
    gradeRelacionadas.className = 'grid';
    gradeRelacionadas.append(...maisObras.map(criarCardObra));
    secaoRelacionadas.append(gradeRelacionadas);
  } else {
    const semRelacionadas = document.createElement('p');
    semRelacionadas.className = 'obra-relacionadas__vazio';
    semRelacionadas.textContent = 'Não há outras obras deste artista cadastradas no acervo.';
    secaoRelacionadas.append(semRelacionadas);
  }

  container.replaceChildren(trilha, artigo, secaoRelacionadas, dialog);
}

try {
  const parametroId = new URLSearchParams(location.search).get('id');
  const id = parametroId !== null && parametroId.trim() !== '' ? Number(parametroId) : NaN;

  if (!Number.isInteger(id) || id < 1) {
    renderizarNaoEncontrada();
  } else {
    const obra = buscarObra(id);
    if (!obra) {
      renderizarNaoEncontrada();
    } else {
      const respostaArtista = listarObras({ artista: obra.artista_id });
      const maisObras = respostaArtista.dados
        .filter((item) => item.id !== obra.id)
        .slice(0, 4);
      renderizarObra(obra, maisObras);
    }
  }
} catch (erro) {
  mostrarToast(erro.message || 'Erro ao carregar os detalhes da obra.', 'erro');
  renderizarNaoEncontrada('Não foi possível carregar a obra');
}
