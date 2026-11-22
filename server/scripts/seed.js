// Responsável: M2 — Seed, dados de demonstração e destaques (Entrega 3)
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
// Nomes de tabela vêm de lista fixa aqui; o SQL nunca usa nomes vindos dos arquivos JSON.
const TABELAS = [
  { nome: 'categorias', colunas: ['id', 'nome'] },
  {
    nome: 'artistas',
    colunas: [
      'id',
      'nome',
      'nacionalidade',
      'ano_nascimento',
      'ano_falecimento',
      'biografia',
      'foto_url',
    ],
  },
  {
    nome: 'obras',
    colunas: [
      'id',
      'titulo',
      'artista_id',
      'categoria_id',
      'ano',
      'tecnica',
      'dimensoes',
      'descricao',
      'imagem_url',
      'em_exibicao',
      'criado_em',
    ],
  },
  {
    nome: 'exposicoes',
    colunas: ['id', 'titulo', 'descricao', 'data_inicio', 'data_fim', 'sala', 'imagem_url'],
  },
  { nome: 'exposicao_obras', colunas: ['exposicao_id', 'obra_id'] },
  {
    nome: 'eventos',
    colunas: [
      'id',
      'titulo',
      'descricao',
      'data_hora',
      'capacidade',
      'preco',
      'exposicao_id',
      'imagem_url',
    ],
  },
];

// Tabelas com coluna id: a sequência precisa continuar depois do maior id do seed,
// senão o próximo INSERT sem id colide com um id que já existe.
const COM_ID = ['categorias', 'artistas', 'obras', 'exposicoes', 'eventos', 'usuarios'];

function traduzirErroTabela(nomeTabela, erro) {
  const arquivo = `${nomeTabela}.json`;

  if (erro.code === '23503') {
    if (nomeTabela === 'obras') {
      return `Em ${arquivo} há uma obra com artista_id ou categoria_id que não existe.`;
    }
    return `Em ${arquivo} há uma referência (chave estrangeira) que não existe.`;
  }

  if (erro.code === '23514' || erro.code === '23502') {
    const regra = erro.constraint || erro.code;
    return `Em ${arquivo} há um valor que não respeita a regra ${regra}.`;
  }

  if (erro.code === '23505') {
    return `Em ${arquivo} há id repetido.`;
  }

  return `Falha ao inserir dados de ${arquivo}: ${erro.message}`;
}

async function inserirTabela(sql, nomeTabela, colunas, linhas) {
  if (!Array.isArray(linhas) || linhas.length === 0) return 0;

  // Lista as colunas explicitamente: colunas novas (geradas, com default) não quebram o seed.
  const lista = colunas.join(', ');
  try {
    await sql(
      `INSERT INTO ${nomeTabela} (${lista})
       SELECT ${lista} FROM json_populate_recordset(NULL::${nomeTabela}, $1)`,
      [JSON.stringify(linhas)],
    );
    return linhas.length;
  } catch (erro) {
    const mensagem = traduzirErroTabela(nomeTabela, erro);
    const detalhe = erro.detail ? ` Detalhe: ${erro.detail}` : '';
    throw new Error(`${mensagem}${detalhe}`, { cause: erro });
  }
}

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
      resumo[nome] = await inserirTabela(sql, nome, colunas, linhas);
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
    console.error(
      `Falha no seed: ${
        erro.code === 'ECONNREFUSED'
          ? 'não foi possível conectar ao PostgreSQL (verifique se o container do Docker ou o serviço local do PostgreSQL está rodando e o .env)'
          : erro.message
      }`,
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
