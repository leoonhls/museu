// Responsável: M4 — veja a seção "M4" no Guia da Entrega 3
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodos() {
  return consultar('SELECT * FROM artistas ORDER BY id');
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM artistas WHERE id = $1', [comoId(id)]);
}
