// Responsável: M1
// Aplica, em ordem alfabética, as migrations de server/db/migrations/ que ainda não rodaram.
// Uso: npm run db:migrar
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PASTA_MIGRATIONS } from '../src/config.js';
import { consultar, pool, transacao } from '../src/db.js';

// Devolve os nomes das migrations aplicadas agora. Não fecha o pool (o resetar.js continua usando).
export async function migrar() {
  await consultar(`
    CREATE TABLE IF NOT EXISTS migracoes (
      nome        text PRIMARY KEY,
      aplicada_em timestamptz NOT NULL DEFAULT now()
    )`);

  const jaAplicadas = new Set((await consultar('SELECT nome FROM migracoes')).map((m) => m.nome));
  const arquivos = (await fs.readdir(PASTA_MIGRATIONS)).filter((a) => a.endsWith('.sql')).sort();

  const aplicadas = [];
  for (const nome of arquivos) {
    if (jaAplicadas.has(nome)) continue;
    const conteudo = await fs.readFile(path.join(PASTA_MIGRATIONS, nome), 'utf8');
    try {
      // O arquivo e o registro em "migracoes" entram juntos: se der erro, nada fica pela metade.
      await transacao(async (sql) => {
        await sql(conteudo);
        await sql('INSERT INTO migracoes (nome) VALUES ($1)', [nome]);
      });
    } catch (erro) {
      erro.migration = nome;
      throw erro;
    }
    aplicadas.push(nome);
  }
  return aplicadas;
}

export function mostrarAplicadas(aplicadas) {
  if (aplicadas.length === 0) console.log('Nenhuma migration nova: o banco já está atualizado.');
  else console.log(`Migrations aplicadas:\n${aplicadas.map((n) => `  ${n}`).join('\n')}`);
}

// Mensagem de erro dos scripts db:*, sem a pilha inteira.
export function explicarErro(erro) {
  if (erro.code === 'ECONNREFUSED') {
    return 'Não consegui conectar ao banco. Ele está ligado? Rode: docker compose up -d';
  }
  if (erro.migration) return `Falha na migration ${erro.migration}: ${erro.message}`;
  return erro.message;
}

// Só roda sozinho quando chamado direto (npm run db:migrar), não quando importado.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    mostrarAplicadas(await migrar());
  } catch (erro) {
    console.error(explicarErro(erro));
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
