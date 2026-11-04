// Responsável: M1
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const PORTA = Number(process.env.PORT) || 3000;
export const SEGREDO_SESSAO = process.env.SESSION_SECRET || 'segredo-de-desenvolvimento';
export const PASTA_CLIENTE = path.join(raiz, 'client');
export const PASTA_DADOS = path.join(raiz, 'server', 'data', 'db');
export const PASTA_SEED = path.join(raiz, 'server', 'data', 'seed');
export const PASTA_UPLOADS = path.join(raiz, 'client', 'assets', 'img', 'uploads');
