// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import * as usuariosRepo from '../../repositorios/usuarios.repo.js';
import { naoImplementado } from '../../erros.js';

function semSenha(usuario) {
  const { senha_hash, ...resto } = usuario;
  return resto;
}

// Usuário da sessão sem senha_hash, ou null.
export async function usuarioAtual(usuarioId) {
  if (!usuarioId) return null;
  const usuario = await usuariosRepo.buscarPorId(usuarioId);
  return usuario ? semSenha(usuario) : null;
}

export async function cadastrar() {
  // TODO (M7): validar nome, e-mail e senha; e-mail único (409); bcrypt; papel visitante; iniciar a sessão
  throw naoImplementado('M7');
}

export async function entrar() {
  // TODO (M7): conferir e-mail e senha com bcrypt (erro genérico 401); gravar usuarioId na sessão
  throw naoImplementado('M7');
}

export async function sair() {
  // TODO (M7): destruir a sessão
  throw naoImplementado('M7');
}

export async function listarFavoritos() {
  // TODO (M7): obras favoritas do usuário logado, com artista_nome e categoria_nome
  throw naoImplementado('M7');
}

export async function favoritar() {
  // TODO (M7): validar a obra (404) e adicionar sem duplicar
  throw naoImplementado('M7');
}

export async function desfavoritar() {
  // TODO (M7): remover o favorito do usuário logado
  throw naoImplementado('M7');
}
