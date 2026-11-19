// Responsável: M1
import { app } from './app.js';
import { PORTA } from './config.js';
import { pool } from './db.js';

// Antes de abrir a porta, confere se o banco está ligado e já tem as tabelas.
try {
  await pool.query('SELECT 1');
  await pool.query('SELECT 1 FROM obras LIMIT 1');
} catch (erro) {
  console.error(
    erro.code === '42P01'
      ? 'Banco sem tabelas. Rode: npm run db:reset'
      : 'Não consegui conectar ao banco. Ele está ligado? Rode: docker compose up -d',
  );
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.warn('Aviso: SESSION_SECRET não definido. Usando um segredo de desenvolvimento.');
}

app.listen(PORTA, () => {
  console.log(`Museu rodando em http://localhost:${PORTA}`);
});
