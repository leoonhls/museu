// Responsável: M8 — veja a seção "M8" no Guia da Entrega 2

import {
  requisicaoInvalida,
  naoEncontrado
  
} from '../../erros.js';


import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import * as favoritosRepo from '../../repositorios/favoritos.repo.js';

export async function criarObra(dados) {
  const titulo = dados?.titulo?.trim();

  if (!titulo) {
    throw requisicaoInvalida('O título da obra é obrigatório.');
  }

if (titulo.length > 150) {
  throw requisicaoInvalida(
    'O título da obra deve ter no máximo 150 caracteres.'
  );
}

const artistaId = Number(dados?.artista_id);

if (!Number.isInteger(artistaId) || artistaId <= 0) {
  throw requisicaoInvalida('Selecione um artista válido.');
}

const categoriaId = Number(dados?.categoria_id);

if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
  throw requisicaoInvalida('Selecione uma categoria válida.');
}

const ano = Number(dados?.ano);

if (!Number.isInteger(ano) || ano < 1 || ano > new Date().getFullYear()) {
  throw requisicaoInvalida('Informe um ano válido para a obra.');
}

const tecnica = dados?.tecnica?.trim();

if (!tecnica) {
  throw requisicaoInvalida('A técnica da obra é obrigatória.');
}

const descricao = dados?.descricao?.trim();

if (!descricao || descricao.length < 20 || descricao.length > 2000) {
  throw requisicaoInvalida(
    'A descrição deve ter de 20 a 2000 caracteres.'
  );
}

  return await obrasRepo.criar({
  ...dados,
  titulo,
  artista_id: artistaId,
  categoria_id: categoriaId,
  ano,
  tecnica,
  descricao
});
}


export async function editarObra(id, dados) {
  const obraExistente = await obrasRepo.buscarPorId(id);
  if (!obraExistente) {
  throw naoEncontrado('Obra não encontrada.');
}
    const titulo = dados?.titulo?.trim();

if (!titulo) {
  throw requisicaoInvalida('O título da obra é obrigatório.');
}
if (titulo.length > 150) {
  throw requisicaoInvalida('O título da obra deve ter no máximo 150 caracteres.');
}
const artistaId = Number(dados?.artista_id);

if (!Number.isInteger(artistaId) || artistaId <= 0) {
  throw requisicaoInvalida('Selecione um artista válido.');
}
const categoriaId = Number(dados?.categoria_id);

if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
  throw requisicaoInvalida('Selecione uma categoria válida.');
}
const ano = Number(dados?.ano);

if (!Number.isInteger(ano) || ano < 1 || ano > new Date().getFullYear()) {
  throw requisicaoInvalida('Informe um ano válido para a obra.');
}
const tecnica = dados?.tecnica?.trim();

if (!tecnica) {
  throw requisicaoInvalida('A técnica da obra é obrigatória.');
}
const descricao = dados?.descricao?.trim();

if (!descricao || descricao.length < 20 || descricao.length > 2000) {
  throw requisicaoInvalida('A descrição deve ter de 20 a 2000 caracteres.');
}
return await obrasRepo.atualizar(id, {
  ...dados,
  titulo,
  artista_id: artistaId,
  categoria_id: categoriaId,
  ano,
  tecnica,
  descricao
});
 
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
    throw requisicaoInvalida('Nenhuma imagem foi enviada.');
  }

  return { url: `/assets/img/uploads/${arquivo.filename}` };
}

