// Responsável: M5 — veja a seção "M5" no Guia da Entrega 3
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodos() {
  return listarComVagas({});
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM eventos WHERE id = $1', [comoId(id)]);
}

export async function listarPorExposicao(exposicaoId) {
  return listarComVagas({ exposicaoId });
}

export async function listarComVagas({ de = null, ate = null, limite = null, exposicaoId = null } = {}) {
  const parametros = [de, ate, comoId(exposicaoId)];
  let sql = `
    SELECT ev.*,
           GREATEST(0, ev.capacidade - COALESCE(r.ocupadas, 0)) AS vagas_restantes
      FROM eventos ev
      LEFT JOIN (
        SELECT evento_id, SUM(qtd_inteira + qtd_meia) AS ocupadas
          FROM reservas
         WHERE status = 'confirmada'
         GROUP BY evento_id
      ) r ON r.evento_id = ev.id
     WHERE ev.data_hora >= COALESCE($1::date, LOCALTIMESTAMP)
       AND ($2::date IS NULL OR ev.data_hora < $2::date + 1)
       AND ($3::integer IS NULL OR ev.exposicao_id = $3)
     ORDER BY ev.data_hora`;

  if (limite !== null) {
    parametros.push(limite);
    sql += ` LIMIT $${parametros.length}`;
  }
  return consultar(sql, parametros);
}
