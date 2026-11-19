// Responsável: M5 — veja a seção "M5" no Guia da Entrega 3
import { comoId, consultar } from '../db.js';

export async function listarPorExposicao(exposicaoId) {
  return consultar('SELECT * FROM exposicao_obras WHERE exposicao_id = $1 ORDER BY obra_id', [
    comoId(exposicaoId),
  ]);
}

export async function listarPorObra(obraId) {
  return consultar('SELECT * FROM exposicao_obras WHERE obra_id = $1 ORDER BY exposicao_id', [
    comoId(obraId),
  ]);
}

export async function excluirPorObra(obraId) {
  await consultar('DELETE FROM exposicao_obras WHERE obra_id = $1', [comoId(obraId)]);
}
