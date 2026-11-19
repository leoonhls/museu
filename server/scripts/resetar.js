// Responsável: M1
// Apaga o banco LOCAL inteiro e recria: migrations + seed.
// Uso: npm run db:reset
import { URL_BANCO } from '../src/config.js';
import { consultar, pool } from '../src/db.js';
import { explicarErro, migrar, mostrarAplicadas } from './migrar.js';
import { semear } from './seed.js';

const host = new URL(URL_BANCO).hostname;
if (!['localhost', '127.0.0.1'].includes(host)) {
  console.error(`Recusado: DATABASE_URL aponta para "${host}". O reset só roda em localhost ou 127.0.0.1.`);
  process.exit(1);
}

try {
  console.log('Apagando o banco local...');
  await consultar('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  mostrarAplicadas(await migrar());
  await semear();
} catch (erro) {
  console.error(explicarErro(erro));
  process.exitCode = 1;
} finally {
  await pool.end();
}
