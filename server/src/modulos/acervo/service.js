// Responsável: M4 — veja a seção "M4" no Guia da Entrega 2
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as categoriasRepo from '../../repositorios/categorias.repo.js';
import * as exposicoesRepo from '../../repositorios/exposicoes.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import { naoEncontrado, requisicaoInvalida } from '../../erros.js';

// req.params.id chega como texto: converte e só aceita inteiro positivo.
function lerId(texto, mensagem = 'Id inválido.') {
  const id = Number(texto);
  if (!Number.isInteger(id) || id < 1) throw requisicaoInvalida(mensagem);
  return id;
}

export async function detalharObra(idTexto) {
  const id = lerId(idTexto);
  const obra = await obrasRepo.buscarPorId(id);
  if (!obra) throw naoEncontrado('Obra não encontrada.');

  // As leituras não dependem umas das outras: rodam ao mesmo tempo.
  const [artista, categoria, vinculos, exposicoes] = await Promise.all([
    artistasRepo.buscarPorId(obra.artista_id),
    categoriasRepo.buscarPorId(obra.categoria_id),
    exposicaoObrasRepo.listarPorObra(obra.id),
    exposicoesRepo.listarTodas(),
  ]);
  const idsExposicoes = vinculos.map((v) => v.exposicao_id);
  return {
    ...obra,
    artista_nome: artista?.nome ?? 'Artista desconhecido',
    categoria_nome: categoria?.nome ?? 'Sem categoria',
    artista,
    categoria,
    exposicoes: exposicoes.filter((e) => idsExposicoes.includes(e.id)),
  };
}

export async function listarArtistas() {
  const artistas = await artistasRepo.listarTodos();
  return artistas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function buscarArtista(idTexto) {
  const id = lerId(idTexto);
  const artista = await artistasRepo.buscarPorId(id);
  if (!artista) throw naoEncontrado('Artista não encontrado.');
  const [obras, categorias] = await Promise.all([obrasRepo.listarTodas(), categoriasRepo.listarTodas()]);
  return {
    ...artista,
    obras: obras
      .filter((obra) => obra.artista_id === artista.id)
      .map((obra) => ({
        ...obra,
        artista_nome: artista.nome,
        categoria_nome: categorias.find((c) => c.id === obra.categoria_id)?.nome ?? 'Sem categoria',
      })),
  };
}

export async function listarCategorias() {
  return categoriasRepo.listarTodas();
}
