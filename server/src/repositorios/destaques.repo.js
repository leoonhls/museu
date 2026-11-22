// Responsável: M2 — consultas SQL da home (Entrega 3)
import { consultar, consultarUm } from '../db.js';

// Exposição atual: a que termina primeiro, caso haja mais de uma
export async function buscarExposicaoAtual() {
  return consultarUm(
    `SELECT *
     FROM exposicoes
     WHERE CURRENT_DATE BETWEEN data_inicio AND data_fim
     ORDER BY data_fim ASC, id ASC
     LIMIT 1`,
  );
}

// 6 obras em destaque, priorizando as que estão em exibição
export async function buscarObrasDestaque() {
  return consultar(
    `SELECT o.*,
            a.nome AS artista_nome,
            c.nome AS categoria_nome
     FROM obras o
     JOIN artistas a ON a.id = o.artista_id
     JOIN categorias c ON c.id = o.categoria_id
     ORDER BY o.em_exibicao DESC, o.id ASC
     LIMIT $1`,
    [6],
  );
}

// 3 próximos eventos com vagas_restantes
// Combine com o M5 para reaproveitar a função dele (ex.: listarComVagas({ limite: 3 }))
// em vez de duplicar a consulta de eventos com vagas.
export async function buscarProximosEventos() {
  return consultar(
    `SELECT ev.*,
            GREATEST(0, ev.capacidade - COALESCE(r.ocupadas, 0))::int AS vagas_restantes
     FROM eventos ev
     LEFT JOIN (
       SELECT evento_id, SUM(qtd_inteira + qtd_meia) AS ocupadas
       FROM reservas
       WHERE status = 'confirmada'
       GROUP BY evento_id
     ) r ON r.evento_id = ev.id
     WHERE ev.data_hora >= LOCALTIMESTAMP
     ORDER BY ev.data_hora ASC, ev.id ASC
     LIMIT $1`,
    [3],
  );
}
