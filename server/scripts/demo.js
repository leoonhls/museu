// Responsável: M2 — dados de demonstração da Entrega 3
// Acrescenta dados de demonstração ao banco depois do npm run db:reset.
// Uso: npm run db:demo (rode depois de npm run db:reset; não é idempotente)
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool, transacao } from '../src/db.js';

const SENHA_VISITANTE = 'visitante1';

const VISITANTES = [
  { nome: 'Ana Silva', email: 'ana@museu.com' },
  { nome: 'Bruno Souza', email: 'bruno@museu.com' },
  { nome: 'Carla Lima', email: 'carla@museu.com' },
];

export async function semearDemo() {
  const senhaHash = await bcrypt.hash(SENHA_VISITANTE, 10);

  await transacao(async (sql) => {
    // 1. Insere os 3 visitantes com papel 'visitante' e senha em hash bcrypt
    const visitantes = [];
    for (const visitante of VISITANTES) {
      const [criado] = await sql(
        `INSERT INTO usuarios (nome, email, senha_hash, papel)
         VALUES ($1, $2, $3, 'visitante')
         RETURNING id, email`,
        [visitante.nome, visitante.email, senhaHash],
      );
      visitantes.push(criado);
    }

    // 2. Insere de 3 a 6 favoritos para cada visitante
    const obras = await sql(`SELECT id FROM obras ORDER BY id ASC LIMIT 6`);
    const quantidadesFavoritos = [3, 4, 6];

    if (obras.length > 0) {
      for (let i = 0; i < visitantes.length; i++) {
        const qtd = Math.min(quantidadesFavoritos[i] ?? 3, obras.length);
        for (let j = 0; j < qtd; j++) {
          const obra = obras[(i + j) % obras.length];
          await sql(
            `INSERT INTO favoritos (usuario_id, obra_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [visitantes[i].id, obra.id],
          );
        }
      }
    }

    // 3. Reservas em eventos futuros: o primeiro fica quase lotado (1 vaga),
    //    o segundo recebe 1 inteira + 1 meia e o terceiro tem 1 reserva cancelada.
    //    Cada reserva aceita no máximo 10 ingressos (reservas_total_valido),
    //    então o "quase lotado" é dividido em várias reservas.
    const eventos = await sql(
      `SELECT ev.id, ev.preco, ev.data_hora::date AS data,
              ev.capacidade - COALESCE(SUM(r.qtd_inteira + r.qtd_meia), 0) AS vagas
       FROM eventos ev
       LEFT JOIN reservas r ON r.evento_id = ev.id AND r.status = 'confirmada'
       WHERE ev.data_hora >= LOCALTIMESTAMP
       GROUP BY ev.id
       ORDER BY ev.data_hora ASC, ev.id ASC
       LIMIT 3`,
    );

    let seq = 0;
    const reservar = (evento, usuarioId, inteira, meia, status = 'confirmada') =>
      sql(
        `INSERT INTO reservas (
           codigo, usuario_id, evento_id, data_visita, qtd_inteira, qtd_meia, valor_total, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          `DEMO-${String(++seq).padStart(3, '0')}`,
          usuarioId,
          evento.id,
          evento.data,
          inteira,
          meia,
          Number(evento.preco) * (inteira + meia / 2),
          status,
        ],
      );

    if (eventos.length > 0) {
      const [quaseLotado] = eventos;
      let restante = Number(quaseLotado.vagas) - 1;
      for (let i = 0; restante > 0; i++) {
        const qtd = Math.min(10, restante);
        await reservar(quaseLotado, visitantes[i % visitantes.length].id, qtd, 0);
        restante -= qtd;
      }

      const segundo = eventos[1] ?? quaseLotado;
      await reservar(segundo, visitantes[1].id, 1, 1);

      const terceiro = eventos[2] ?? segundo;
      await reservar(terceiro, visitantes[2].id, 1, 0, 'cancelada');
    }
  });

  console.log('Dados de demonstração inseridos com sucesso.');
  console.log(`Logins de visitante: ${VISITANTES.map((v) => v.email).join(', ')} (senha ${SENHA_VISITANTE})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await semearDemo();
  } catch (erro) {
    console.error(
      `Falha no demo: ${
        erro.code === '23505'
          ? 'os dados de demonstração já existem (rode npm run db:reset antes)'
          : erro.message
      }`,
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
