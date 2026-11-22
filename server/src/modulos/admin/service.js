// Responsável: M8 — veja a seção "M8" no Guia da Entrega 2

import { requisicaoInvalida, naoEncontrado } from '../../erros.js';

import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as categoriasRepo from '../../repositorios/categorias.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import * as favoritosRepo from '../../repositorios/favoritos.repo.js';
function traduzirErroPostgres(erro) {
  if (erro.code === '23503') {
    throw requisicaoInvalida('Artista ou categoria informado não existe.');
  }

  if (erro.code === '23514') {
    const mensagens = {
      obras_titulo_tamanho: 'O título deve ter entre 1 e 150 caracteres.',
      obras_ano_valido: 'O ano da obra deve ser maior que zero.',
      obras_descricao_tamanho: 'A descrição deve ter entre 20 e 2000 caracteres.',
      obras_imagem_url_valida: 'O endereço da imagem é inválido.',
    };

    throw requisicaoInvalida(mensagens[erro.constraint] || 'Os dados da obra são inválidos.');
  }

  throw erro;
}
// Texto sem espaços nas pontas; qualquer outro tipo (número, objeto) vira ''.
const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

function lerId(idTexto) {
  const id = Number(idTexto);
  if (!Number.isInteger(id) || id < 1) throw requisicaoInvalida('Id inválido.');
  return id;
}

async function validarObra(dados) {
  const titulo = texto(dados?.titulo);

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
  const tecnica = texto(dados?.tecnica);

  if (!tecnica) {
    throw requisicaoInvalida('Informe a técnica.');
  }
  const descricao = texto(dados?.descricao);

  if (!descricao || descricao.length < 20 || descricao.length > 2000) {
    throw requisicaoInvalida('A descrição deve ter de 20 a 2000 caracteres.');
  }
  // A mesma regra está no banco (CHECK obras_imagem_url_valida em 10_acervo.sql).
  const imagemUrl = texto(dados?.imagem_url);

  if (
    !imagemUrl ||
    imagemUrl.length > 300 ||
    (!imagemUrl.startsWith('/assets/img/') && !imagemUrl.startsWith('https://'))
  ) {
    throw requisicaoInvalida(
      'Informe o endereço da imagem (começando com /assets/img/ ou https://).',
    );
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
    dimensoes: texto(dados?.dimensoes),
    em_exibicao: dados?.em_exibicao ?? false,
    imagem_url: imagemUrl,
  };
}
export async function criarObra(dados) {
  const obraValidada = await validarObra(dados);

  try {
    return await obrasRepo.criar(obraValidada);
  } catch (erro) {
    traduzirErroPostgres(erro);
  }
}

export async function editarObra(idTexto, dados) {
  const id = lerId(idTexto);
  const obraValidada = await validarObra(dados);

  try {
    const obraAtualizada = await obrasRepo.atualizar(id, obraValidada);

    if (!obraAtualizada) {
      throw naoEncontrado('Obra não encontrada.');
    }

    return obraAtualizada;
  } catch (erro) {
    traduzirErroPostgres(erro);
  }
}

export async function excluirObra(idTexto) {
  const id = lerId(idTexto);
  const obraExistente = await obrasRepo.buscarPorId(id);
  if (!obraExistente) {
    throw naoEncontrado('Obra não encontrada.');
  }
  await exposicaoObrasRepo.excluirPorObra(id);
  await favoritosRepo.excluirPorObra(id);
  return await obrasRepo.excluir(id);
}
