// Responsável: M6 — veja a seção "M6" no Guia da Entrega 3

import { comoId, consultar, consultarUm, transacao } from '../db.js';
import { requisicaoInvalida, naoEncontrado } from '../erros.js';

const INSERIR = `
  INSERT INTO reservas (codigo, usuario_id, evento_id, data_visita, qtd_inteira, qtd_meia, valor_total, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *`;

// status padrão 'confirmada': só as confirmadas contam na lotação do evento.
const valores = (dados) => [
  dados.codigo,
  dados.usuario_id,
  dados.evento_id ?? null,
  dados.data_visita,
  dados.qtd_inteira ?? 0,
  dados.qtd_meia ?? 0,
  dados.valor_total,
  dados.status ?? 'confirmada',
];

// Mais recentes primeiro.
export async function listarPorUsuario(usuarioId) {
  return consultar(
    'SELECT * FROM reservas WHERE usuario_id = $1 ORDER BY criado_em DESC, id DESC',
    [comoId(usuarioId)],
  );
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM reservas WHERE id = $1', [comoId(id)]);
}

export async function criar(dados) {
  return consultarUm(INSERIR, valores(dados));
}

// Cria uma reserva de evento somente se ainda houver vagas.
export async function criarComLimite(dados) {
  return transacao(async (sql) => {
    const [evento] = await sql('SELECT capacidade FROM eventos WHERE id = $1 FOR UPDATE', [
      dados.evento_id,
    ]);

    if (!evento) {
      throw naoEncontrado('Evento não encontrado.');
    }

    const [{ ocupadas }] = await sql(
      `SELECT COALESCE(SUM(qtd_inteira + qtd_meia), 0) AS ocupadas
         FROM reservas
        WHERE evento_id = $1 AND status = 'confirmada'`,
      [dados.evento_id],
    );

    const restam = evento.capacidade - ocupadas;
    const pedidas = dados.qtd_inteira + dados.qtd_meia;

    if (pedidas > restam) {
      throw requisicaoInvalida(
        restam > 0 ? `Restam apenas ${restam} vagas para este evento.` : 'Evento esgotado.',
      );
    }

    const [reserva] = await sql(INSERIR, valores(dados));
    return reserva;
  });
}

// Cancela somente reservas confirmadas, do usuário e que ainda não aconteceram
// (visita de hoje em diante; reserva de evento só antes do horário do evento).
export async function cancelarSePermitido(id, usuarioId) {
  return consultarUm(
    `UPDATE reservas
        SET status = 'cancelada'
      WHERE id = $1
        AND usuario_id = $2
        AND status = 'confirmada'
        AND data_visita >= CURRENT_DATE
        AND (
          evento_id IS NULL
          OR EXISTS (SELECT 1 FROM eventos ev WHERE ev.id = reservas.evento_id AND ev.data_hora > LOCALTIMESTAMP)
        )
      RETURNING *`,
    [comoId(id), comoId(usuarioId)],
  );
}
