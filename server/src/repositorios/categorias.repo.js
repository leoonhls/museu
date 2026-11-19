// Responsável: M4 — veja a seção "M4" no Guia da Entrega 3
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodas() {
  return consultar('SELECT * FROM categorias ORDER BY id');
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM categorias WHERE id = $1', [comoId(id)]);
}
