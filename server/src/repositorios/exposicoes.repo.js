// Responsável: M5 — veja a seção "M5" no Guia da Entrega 3
// TODO (M5): calcular o status (atual, futura, passada) no SQL com CURRENT_DATE.
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodas() {
  return consultar('SELECT * FROM exposicoes ORDER BY id');
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM exposicoes WHERE id = $1', [comoId(id)]);
}
