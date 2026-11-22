// Responsável: M4 — veja a seção "M4" no Guia da Entrega 3
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as categoriasRepo from '../../repositorios/categorias.repo.js';
import { naoEncontrado, requisicaoInvalida } from '../../erros.js';

// req.params.id chega como texto: converte e só aceita inteiro positivo.
function lerId(texto, mensagem = 'Id inválido.') {
  const id = Number(texto);
  if (!Number.isInteger(id) || id < 1) throw requisicaoInvalida(mensagem);
  return id;
}

export async function detalharObra(idTexto) {
  const id = lerId(idTexto);
  const obra = await obrasRepo.buscarDetalhe(id);
  if (!obra) throw naoEncontrado('Obra não encontrada.');
  return obra;
}

export async function listarArtistas() {
  const artistas = await artistasRepo.listarTodos();
  return artistas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function buscarArtista(idTexto) {
  const id = lerId(idTexto);
  const artista = await artistasRepo.buscarPorId(id);
  if (!artista) throw naoEncontrado('Artista não encontrado.');
  const obras = await obrasRepo.listarPorArtista(id);
  return { ...artista, obras };
}

export async function listarCategorias() {
  return categoriasRepo.listarTodas();
}
