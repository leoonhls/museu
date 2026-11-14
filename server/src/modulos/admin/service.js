// Responsável: M8 — veja a seção "M8" no Guia da Entrega 2

import { requisicaoInvalida, naoEncontrado } from '../../erros.js';

import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as categoriasRepo from '../../repositorios/categorias.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import * as favoritosRepo from '../../repositorios/favoritos.repo.js';
async function validarObra(dados) {
  const titulo = dados?.titulo?.trim();

  if (!titulo) {
    throw requisicaoInvalida('Informe o título (até 150 caracteres).');
  }

  if (titulo.length > 150) {
    throw requisicaoInvalida('Informe o título (até 150 caracteres).');
  }
  const artistaId = Number(dados?.artista_id);
  if (!Number.isInteger(artistaId) || artistaId <= 0) {
    throw requisicaoInvalida('Artista inválido.');
  }
  const artistaExistente = await artistasRepo.buscarPorId(artistaId);

  if (!artistaExistente) {
    throw requisicaoInvalida('Artista inválido.');
  }
  const categoriaId = Number(dados?.categoria_id);

  if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
    throw requisicaoInvalida('Categoria inválida.');
  }
  const categoriaExistente = await categoriasRepo.buscarPorId(categoriaId);

  if (!categoriaExistente) {
    throw requisicaoInvalida('Categoria inválida.');
  }
  const ano = Number(dados?.ano);

  if (!Number.isInteger(ano) || ano < 1 || ano > new Date().getFullYear()) {
    throw requisicaoInvalida('Ano inválido.');
  }
  const tecnica = dados?.tecnica?.trim();

  if (!tecnica) {
    throw requisicaoInvalida('Informe a técnica.');
  }
  const descricao = dados?.descricao?.trim();

  if (!descricao || descricao.length < 20 || descricao.length > 2000) {
    throw requisicaoInvalida('A descrição deve ter de 20 a 2000 caracteres.');
  }
  const imagemUrl = dados?.imagem_url?.trim();

  if (!imagemUrl || (!imagemUrl.startsWith('/assets/img/') && !imagemUrl.startsWith('https://'))) {
    throw requisicaoInvalida('Imagem inválida.');
  }
  if (dados?.em_exibicao !== undefined && typeof dados.em_exibicao !== 'boolean') {
    throw requisicaoInvalida('Em exibição deve ser verdadeiro ou falso.');
  }
  if (dados?.dimensoes !== undefined && typeof dados.dimensoes !== 'string') {
    throw requisicaoInvalida('Dimensões inválidas.');
  }
  return {
    titulo,
    artista_id: artistaId,
    categoria_id: categoriaId,
    ano,
    tecnica,
    descricao,
    dimensoes: dados?.dimensoes ?? '',
    em_exibicao: dados?.em_exibicao ?? false,
    imagem_url: imagemUrl,
  };
}
export async function criarObra(dados) {
  const obraValidada = await validarObra(dados);
  return await obrasRepo.criar(obraValidada);
}

export async function editarObra(id, dados) {
  const obraExistente = await obrasRepo.buscarPorId(id);
  if (!obraExistente) {
    throw naoEncontrado('Obra não encontrada.');
  }
  const obraValidada = await validarObra(dados);

  return await obrasRepo.atualizar(id, obraValidada);
}
export async function excluirObra(id) {
  const obraExistente = await obrasRepo.buscarPorId(id);
  if (!obraExistente) {
    throw naoEncontrado('Obra não encontrada.');
  }
  await exposicaoObrasRepo.excluirPorObra(id);
  await favoritosRepo.excluirPorObra(id);
  return await obrasRepo.excluir(id);
}

export async function enviarImagem(arquivo) {
  if (!arquivo) {
    throw requisicaoInvalida('Imagem inválida.');
  }

  return { url: `/assets/img/uploads/${arquivo.filename}` };
}
