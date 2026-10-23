// Responsável: M4 — veja a seção "M4 — Obra, artista e dados reais" no Guia da Entrega 1
import { buscarArtista } from '../api.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { criarCardObra } from '../components/card-obra.js';
import { mostrarToast } from '../components/toast.js';
import { urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const container = document.querySelector('#conteudo-artista');

function renderizarNaoEncontrado(mensagem = 'Artista não encontrado') {
  document.title = 'Artista não encontrado — Museu';

  const secao = document.createElement('section');
  secao.className = 'card artista-vazio';

  const titulo = document.createElement('h1');
  titulo.textContent = mensagem;

  const texto = document.createElement('p');
  texto.textContent =
    'O artista que você tentou acessar não consta no catálogo do museu ou o endereço está incorreto.';

  const linkVoltar = document.createElement('a');
  linkVoltar.href = urlApp('pages/obras.html');
  linkVoltar.className = 'botao';
  linkVoltar.textContent = 'Voltar ao acervo';

  secao.append(titulo, texto, linkVoltar);
  container.replaceChildren(secao);
}

function renderizarArtista(artista) {
  document.title = `${artista.nome} — Museu`;

  const trilha = document.createElement('nav');
  trilha.className = 'artista-trilha';
  trilha.setAttribute('aria-label', 'Navegação estrutural');

  const linkAcervo = document.createElement('a');
  linkAcervo.href = urlApp('pages/obras.html');
  linkAcervo.textContent = '← Voltar ao acervo';
  trilha.append(linkAcervo);

  const perfil = document.createElement('section');
  perfil.className = 'artista-perfil card';
  perfil.setAttribute('aria-labelledby', 'nome-artista');

  const molduraFoto = document.createElement('div');
  molduraFoto.className = 'artista-perfil__moldura';

  const foto = document.createElement('img');
  foto.className = 'artista-perfil__foto';
  foto.src = urlApp(artista.foto_url);
  foto.alt = `Retrato de ${artista.nome}`;

  molduraFoto.append(foto);

  const dados = document.createElement('div');
  dados.className = 'artista-perfil__dados';

  const metadados = document.createElement('div');
  metadados.className = 'artista-perfil__metadados';

  const tagNacionalidade = document.createElement('span');
  tagNacionalidade.className = 'tag';
  tagNacionalidade.textContent = artista.nacionalidade;

  const anosVida = document.createElement('span');
  anosVida.className = 'artista-perfil__anos';
  anosVida.textContent = `${artista.ano_nascimento}–${artista.ano_falecimento}`;

  metadados.append(tagNacionalidade, anosVida);

  const nome = document.createElement('h1');
  nome.id = 'nome-artista';
  nome.className = 'artista-perfil__nome';
  nome.textContent = artista.nome;

  const biografia = document.createElement('p');
  biografia.className = 'artista-perfil__biografia';
  biografia.textContent = artista.biografia;

  dados.append(metadados, nome, biografia);
  perfil.append(molduraFoto, dados);

  const secaoObras = document.createElement('section');
  secaoObras.className = 'artista-obras';
  secaoObras.setAttribute('aria-labelledby', 'titulo-obras-artista');

  const cabecalhoObras = document.createElement('div');
  cabecalhoObras.className = 'artista-obras__cabecalho';

  const tituloObras = document.createElement('h2');
  tituloObras.id = 'titulo-obras-artista';
  tituloObras.textContent = `Obras de ${artista.nome}`;

  const totalObras = Array.isArray(artista.obras) ? artista.obras.length : 0;
  const contador = document.createElement('span');
  contador.className = 'artista-obras__contador';
  contador.textContent =
    totalObras === 1 ? '1 obra no acervo' : `${totalObras} obras no acervo`;

  cabecalhoObras.append(tituloObras, contador);
  secaoObras.append(cabecalhoObras);

  if (totalObras > 0) {
    const grade = document.createElement('div');
    grade.className = 'grid';
    grade.append(...artista.obras.map(criarCardObra));
    secaoObras.append(grade);
  } else {
    const semObras = document.createElement('p');
    semObras.className = 'artista-obras__vazio';
    semObras.textContent = 'Nenhuma obra encontrada para este artista no momento.';
    secaoObras.append(semObras);
  }

  container.replaceChildren(trilha, perfil, secaoObras);
}

try {
  const parametroId = new URLSearchParams(location.search).get('id');
  const id = parametroId !== null && parametroId.trim() !== '' ? Number(parametroId) : NaN;

  if (!Number.isInteger(id) || id < 1) {
    renderizarNaoEncontrado();
  } else {
    const artista = buscarArtista(id);
    if (!artista) {
      renderizarNaoEncontrado();
    } else {
      renderizarArtista(artista);
    }
  }
} catch (erro) {
  mostrarToast(erro.message || 'Erro ao carregar os dados do artista.', 'erro');
  renderizarNaoEncontrado('Não foi possível carregar o artista');
}
