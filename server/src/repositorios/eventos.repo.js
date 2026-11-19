// Responsável: M5 — veja a seção "M5" no Guia da Entrega 3
// TODO (M5): calcular vagas restantes no SQL (LEFT JOIN com reservas e SUM).
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodos() {
  return consultar('SELECT * FROM eventos ORDER BY id');
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM eventos WHERE id = $1', [comoId(id)]);
}

export async function listarPorExposicao(exposicaoId) {
  return consultar('SELECT * FROM eventos WHERE exposicao_id = $1 ORDER BY id', [comoId(exposicaoId)]);
}
