// Responsável: M1
import fs from 'node:fs';
import path from 'node:path';
import { app } from './app.js';
import { PASTA_DADOS, PORTA } from './config.js';

if (!fs.existsSync(path.join(PASTA_DADOS, 'obras.json'))) {
  console.error('Banco vazio. Rode: npm run seed');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.warn('Aviso: SESSION_SECRET não definido. Usando um segredo de desenvolvimento.');
}

app.listen(PORTA, () => {
  console.log(`Museu rodando em http://localhost:${PORTA}`);
});
