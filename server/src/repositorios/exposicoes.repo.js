// Responsável: M5 — veja a seção "M5" no Guia da Entrega 3
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodas(status = null) {
  return consultar(
    `SELECT *
       FROM (
         SELECT e.*,
                CASE
                  WHEN CURRENT_DATE < e.data_inicio THEN 'futura'
                  WHEN CURRENT_DATE > e.data_fim THEN 'passada'
                  ELSE 'atual'
                END AS status
           FROM exposicoes e
       ) x
      WHERE ($1::text IS NULL OR x.status = $1)
      ORDER BY CASE WHEN x.status = 'passada' THEN 1 ELSE 0 END,
               CASE WHEN x.status = 'passada' THEN x.data_inicio ELSE NULL END DESC,
               x.data_inicio ASC,
               x.id`,
    [status],
  );
}

export async function buscarPorId(id) {
  return consultarUm(
    `SELECT e.*,
            CASE
              WHEN CURRENT_DATE < e.data_inicio THEN 'futura'
              WHEN CURRENT_DATE > e.data_fim THEN 'passada'
              ELSE 'atual'
            END AS status
       FROM exposicoes e
      WHERE e.id = $1`,
    [comoId(id)],
  );
}
