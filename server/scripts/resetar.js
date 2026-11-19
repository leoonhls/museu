// Responsável: M1
// Apaga o banco LOCAL inteiro e recria: arquivos de server/db/esquema/ (em ordem) + seed.
// Uso: npm run db:reset
import fs from 'node:fs/promises';
import path from 'node:path';
import { PASTA_ESQUEMA, URL_BANCO } from '../src/config.js';
import { consultar, pool } from '../src/db.js';
import { semear } from './seed.js';

const host = new URL(URL_BANCO).hostname;
if (!['localhost', '127.0.0.1'].includes(host)) {
  console.error(`Recusado: DATABASE_URL aponta para "${host}". O reset só roda em localhost ou 127.0.0.1.`);
  process.exit(1);
}

try {
  console.log('Apagando o banco local...');
  await consultar('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

  // Os arquivos rodam em ordem alfabética: 01_, 10_, 20_... (quem é referenciado vem antes).
  const arquivos = (await fs.readdir(PASTA_ESQUEMA)).filter((a) => a.endsWith('.sql')).sort();
  console.log('Criando as tabelas:');
  for (const nome of arquivos) {
    const conteudo = await fs.readFile(path.join(PASTA_ESQUEMA, nome), 'utf8');
    try {
      await consultar(conteudo);
    } catch (erro) {
      erro.arquivo = nome;
      throw erro;
    }
    console.log(`  ${nome}`);
  }

  await semear();
} catch (erro) {
  if (erro.code === 'ECONNREFUSED') {
    console.error('Não consegui conectar ao banco. Ele está ligado? Rode: docker compose up -d');
  } else if (erro.arquivo) {
    console.error(`Erro no arquivo server/db/esquema/${erro.arquivo}: ${erro.message}`);
  } else {
    console.error(erro.message);
  }
  process.exitCode = 1;
} finally {
  await pool.end();
}
