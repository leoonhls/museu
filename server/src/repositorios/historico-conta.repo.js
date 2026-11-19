// Responsável: M7 — veja a seção "M7" no Guia da Entrega 3
import { comoId, consultar } from '../db.js';

// As 50 ações mais recentes do usuário.
export async function listarPorUsuario(usuarioId) {
  return consultar(
    `SELECT tipo, descricao, data_hora
       FROM historico_conta
      WHERE usuario_id = $1
      ORDER BY data_hora DESC, id DESC
      LIMIT 50`,
    [comoId(usuarioId)],
  );
}

export async function registrar(usuarioId, tipo, descricao) {
  await consultar('INSERT INTO historico_conta (usuario_id, tipo, descricao) VALUES ($1, $2, $3)', [
    comoId(usuarioId),
    tipo,
    descricao,
  ]);
}
