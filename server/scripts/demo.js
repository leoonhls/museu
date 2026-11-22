// Responsável: M2 — dados de demonstração da Entrega 3
// Acrescenta dados de demonstração ao banco depois do npm run db:reset.
// Uso: npm run db:demo (combinar script no package.json com o M1)
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

    // 3. Insere reservas confirmadas em eventos futuros (deixando um quase lotado)
    //    e 1 reserva cancelada
    const eventosFuturos = await sql(
      `SELECT id, capacidade, preco
       FROM eventos
       WHERE data_hora >= LOCALTIMESTAMP
       ORDER BY data_hora ASC, id ASC`,
    );

    if (eventosFuturos.length > 0) {
      const eventoQuaseLotado = eventosFuturos[0];
      const capacidade = Number(eventoQuaseLotado.capacidade) || 1;
      const qtdQuaseLotado = Math.max(1, capacidade - 1);
      const precoPrimeiro = Number(eventoQuaseLotado.preco) || 0;

      // Reserva confirmada deixando o primeiro evento futuro quase lotado (1 vaga restante)
      await sql(
        `INSERT INTO reservas (
           codigo, usuario_id, evento_id, data_visita, qtd_inteira, qtd_meia, valor_total, status
         )
         VALUES ($1, $2, $3, CURRENT_DATE, $4, 0, $5, 'confirmada')`,
        [
          'DEMO-CONF-001',
          visitantes[0].id,
          eventoQuaseLotado.id,
          qtdQuaseLotado,
          qtdQuaseLotado * precoPrimeiro,
        ],
      );

      // Segunda reserva confirmada em evento futuro
      const segundoEvento = eventosFuturos[1] ?? eventoQuaseLotado;
      const precoSegundo = Number(segundoEvento.preco) || 0;
      await sql(
        `INSERT INTO reservas (
           codigo, usuario_id, evento_id, data_visita, qtd_inteira, qtd_meia, valor_total, status
         )
         VALUES ($1, $2, $3, CURRENT_DATE, 1, 1, $4, 'confirmada')`,
        ['DEMO-CONF-002', visitantes[1].id, segundoEvento.id, precoSegundo * 1.5],
      );

      // 1 reserva cancelada em evento futuro
      const eventoCancelada = eventosFuturos[2] ?? segundoEvento;
      const precoCancelada = Number(eventoCancelada.preco) || 0;
      await sql(
        `INSERT INTO reservas (
           codigo, usuario_id, evento_id, data_visita, qtd_inteira, qtd_meia, valor_total, status
         )
         VALUES ($1, $2, $3, CURRENT_DATE, 1, 0, $4, 'cancelada')`,
        ['DEMO-CANC-001', visitantes[2].id, eventoCancelada.id, precoCancelada],
      );
    }
  });

  console.log('Dados de demonstração inseridos com sucesso.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await semearDemo();
  } catch (erro) {
    console.error(`Falha no demo: ${erro.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
