// Responsável: M2 — versão mínima do setup da Entrega 3 (veja a seção "M2" do guia)
// Coloca no banco os dados iniciais de server/data/seed/ e o usuário admin.
// Uso: npm run db:seed (o npm run db:reset já roda este script)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PASTA_SEED } from '../src/config.js';
import { pool, transacao } from '../src/db.js';

const SENHA_ADMIN = process.env.SEED_ADMIN_SENHA || 'admin123';

// Na ordem das chaves estrangeiras: quem é referenciado entra antes.
// Tabelas e colunas são fixas aqui; o SQL nunca usa nomes vindos dos arquivos JSON.
const TABELAS = [
  { nome: 'categorias', colunas: ['id', 'nome'] },
  {
    nome: 'artistas',
    colunas: ['id', 'nome', 'nacionalidade', 'ano_nascimento', 'ano_falecimento', 'biografia', 'foto_url'],
  },
  {
    nome: 'obras',
    colunas: [
      'id', 'titulo', 'artista_id', 'categoria_id', 'ano', 'tecnica', 'dimensoes',
      'descricao', 'imagem_url', 'em_exibicao', 'criado_em',
    ],
  },
  {
    nome: 'exposicoes',
    colunas: ['id', 'titulo', 'descricao', 'data_inicio', 'data_fim', 'sala', 'imagem_url'],
  },
  { nome: 'exposicao_obras', colunas: ['exposicao_id', 'obra_id'] },
  {
    nome: 'eventos',
    colunas: ['id', 'titulo', 'descricao', 'data_hora', 'capacidade', 'preco', 'exposicao_id', 'imagem_url'],
  },
];

// Tabelas com coluna id: a sequência precisa continuar depois do maior id do seed,
// senão o próximo INSERT sem id colide com um id que já existe.
const COM_ID = ['categorias', 'artistas', 'obras', 'exposicoes', 'eventos', 'usuarios'];

export async function semear() {
  const resumo = {};
  const senhaHash = await bcrypt.hash(SENHA_ADMIN, 10);

  await transacao(async (sql) => {
    // Começa do zero, para "npm run db:seed" poder rodar mais de uma vez.
    // CASCADE também esvazia favoritos, reservas e histórico, que apontam para essas tabelas.
    // As sessões saem junto: senão um login antigo apontaria para o novo usuário de mesmo id.
    await sql(
      `TRUNCATE ${TABELAS.map((t) => t.nome).join(', ')}, usuarios, sessoes RESTART IDENTITY CASCADE`,
    );

    for (const { nome, colunas } of TABELAS) {
      const linhas = JSON.parse(await fs.readFile(path.join(PASTA_SEED, `${nome}.json`), 'utf8'));
      const marcadores = colunas.map((_, i) => `$${i + 1}`).join(', ');
      const texto = `INSERT INTO ${nome} (${colunas.join(', ')}) VALUES (${marcadores})`;
      for (const linha of linhas) {
        await sql(
          texto,
          colunas.map((coluna) => linha[coluna] ?? null),
        );
      }
      resumo[nome] = linhas.length;
    }

    await sql('INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1, $2, $3, $4)', [
      'Administrador',
      'admin@museu.com',
      senhaHash,
      'admin',
    ]);
    resumo.usuarios = 1;

    for (const tabela of COM_ID) {
      await sql(
        `SELECT setval(pg_get_serial_sequence('${tabela}', 'id'),
                       COALESCE((SELECT MAX(id) FROM ${tabela}), 0) + 1, false)`,
      );
    }
  });

  console.log('Dados iniciais inseridos:');
  for (const [nome, total] of Object.entries(resumo)) console.log(`  ${nome}: ${total}`);
  console.log(`Login do admin: admin@museu.com / ${SENHA_ADMIN}`);
}

// Só roda sozinho quando chamado direto (npm run db:seed), não quando importado.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await semear();
  } catch (erro) {
    console.error(`Falha no seed: ${erro.code === 'ECONNREFUSED' ? 'banco desligado (docker compose up -d)' : erro.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
