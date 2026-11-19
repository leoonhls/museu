// Responsável: M1
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const PORTA = Number(process.env.PORT) || 3000;
export const SEGREDO_SESSAO = process.env.SESSION_SECRET || 'segredo-de-desenvolvimento';
export const URL_BANCO = process.env.DATABASE_URL || 'postgres://museu:museu@localhost:5432/museu';
export const PASTA_CLIENTE = path.join(raiz, 'client');
export const PASTA_SEED = path.join(raiz, 'server', 'data', 'seed');
export const PASTA_MIGRATIONS = path.join(raiz, 'server', 'db', 'migrations');
export const PASTA_UPLOADS = path.join(raiz, 'client', 'assets', 'img', 'uploads');
