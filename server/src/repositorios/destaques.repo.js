// Responsável: M2 — consultas SQL da home (Entrega 3)
import { consultar, consultarUm } from '../db.js';
import * as eventosRepo from './eventos.repo.js';

// Exposição atual: a que termina primeiro, caso haja mais de uma.
// O status vai na resposta, como em GET /api/exposicoes e na Entrega 2.
export async function buscarExposicaoAtual() {
  return consultarUm(
    `SELECT *, 'atual' AS status
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

// 3 próximos eventos com vagas_restantes (reaproveita a consulta do M5)
export function buscarProximosEventos() {
  return eventosRepo.listarComVagas({ limite: 3 });
}
