// Responsável: M1
// Recria do zero o "banco" de desenvolvimento em server/data/db/.
// Uso: npm run seed
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { PASTA_DADOS, PASTA_SEED } from '../src/config.js';

const TABELAS_SEED = ['obras', 'artistas', 'categorias', 'exposicoes', 'exposicao_obras', 'eventos'];
const SENHA_ADMIN = process.env.SEED_ADMIN_SENHA || 'admin123';

async function gravar(nome, linhas) {
  await fs.writeFile(path.join(PASTA_DADOS, `${nome}.json`), JSON.stringify(linhas, null, 2) + '\n');
}

await fs.rm(PASTA_DADOS, { recursive: true, force: true });
await fs.mkdir(PASTA_DADOS, { recursive: true });

const resumo = {};
for (const nome of TABELAS_SEED) {
  const linhas = JSON.parse(await fs.readFile(path.join(PASTA_SEED, `${nome}.json`), 'utf8'));
  await gravar(nome, linhas);
  resumo[nome] = linhas.length;
}

const usuarios = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@museu.com',
    senha_hash: await bcrypt.hash(SENHA_ADMIN, 10),
    papel: 'admin',
    criado_em: new Date().toISOString(),
  },
];
await gravar('usuarios', usuarios);
await gravar('favoritos', []);
await gravar('reservas', []);
Object.assign(resumo, { usuarios: usuarios.length, favoritos: 0, reservas: 0 });

console.log('Banco recriado em server/data/db/:');
for (const [nome, total] of Object.entries(resumo)) console.log(`  ${nome}.json: ${total}`);
console.log(`Login do admin: admin@museu.com / ${SENHA_ADMIN}`);
