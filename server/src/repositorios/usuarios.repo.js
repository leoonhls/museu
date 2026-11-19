// Responsável: M7 — veja a seção "M7" no Guia da Entrega 3
// Devolve o usuário completo, com senha_hash: só o módulo conta usa este repositório,
// e o service dele remove o campo antes de responder.
// TODO (M7): e-mail único garantido pelo banco (UNIQUE) e tratamento do erro 23505.
import { comoId, consultarUm } from '../db.js';

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM usuarios WHERE id = $1', [comoId(id)]);
}

export async function buscarPorEmail(email) {
  const procurado = String(email).trim().toLowerCase();
  return consultarUm('SELECT * FROM usuarios WHERE email = $1', [procurado]);
}

export async function criar(dados) {
  return consultarUm(
    `INSERT INTO usuarios (nome, email, senha_hash, papel, perfil)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [dados.nome, dados.email, dados.senha_hash, dados.papel ?? 'visitante', dados.perfil ?? {}],
  );
}

// Devolve o usuário atualizado, ou null se não existir.
export async function atualizarPerfil(id, perfil) {
  return consultarUm('UPDATE usuarios SET perfil = $2 WHERE id = $1 RETURNING *', [comoId(id), perfil]);
}
