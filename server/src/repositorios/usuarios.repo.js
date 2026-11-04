// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
// Devolve o usuário completo, com senha_hash: só o módulo conta usa este repositório,
// e o service dele remove o campo antes de responder.
import { atualizarTabela, lerTabela, proximoId } from './base-json.js';

export async function buscarPorId(id) {
  return (await lerTabela('usuarios')).find((usuario) => usuario.id === Number(id)) ?? null;
}

export async function buscarPorEmail(email) {
  const procurado = String(email).trim().toLowerCase();
  return (await lerTabela('usuarios')).find((usuario) => usuario.email === procurado) ?? null;
}

export async function criar(dados) {
  return atualizarTabela('usuarios', (linhas) => {
    const usuario = { ...dados, id: proximoId(linhas), criado_em: new Date().toISOString() };
    return { linhas: [...linhas, usuario], resultado: usuario };
  });
}
