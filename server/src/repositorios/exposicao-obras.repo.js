// Responsável: M5 — veja a seção "M5" no Guia da Entrega 3
import { comoId, consultar } from '../db.js';

export async function listarPorExposicao(exposicaoId) {
  return consultar(
    `SELECT o.*, a.nome AS artista_nome
       FROM exposicao_obras eo
       JOIN obras o ON o.id = eo.obra_id
       JOIN artistas a ON a.id = o.artista_id
      WHERE eo.exposicao_id = $1
      ORDER BY o.titulo`,
    [comoId(exposicaoId)],
  );
}

export async function listarPorObra(obraId) {
  return consultar('SELECT * FROM exposicao_obras WHERE obra_id = $1 ORDER BY exposicao_id', [
    comoId(obraId),
  ]);
}
