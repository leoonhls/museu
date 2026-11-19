// Responsável: M1 — conexão com o PostgreSQL
import pg from 'pg';
import { URL_BANCO } from './config.js';

// Converte os tipos do banco para os formatos que a API já usava
pg.types.setTypeParser(1082, (v) => v); // date      -> '2026-09-01'
pg.types.setTypeParser(1114, (v) => v.replace(' ', 'T')); // timestamp -> '2026-11-14T15:00:00'
pg.types.setTypeParser(1700, (v) => Number(v)); // numeric   -> 20 (não '20.00')
pg.types.setTypeParser(20, (v) => Number(v)); // bigint (COUNT, SUM) -> número

export const pool = new pg.Pool({ connectionString: URL_BANCO });

// Executa uma consulta e devolve as linhas
export async function consultar(sql, parametros = []) {
  const { rows } = await pool.query(sql, parametros);
  return rows;
}

// Executa uma consulta e devolve a primeira linha, ou null
export async function consultarUm(sql, parametros = []) {
  const linhas = await consultar(sql, parametros);
  return linhas[0] ?? null;
}

// Executa várias consultas como uma unidade: ou tudo, ou nada.
// Uso: await transacao(async (sql) => { await sql('UPDATE ...', [..]); ... });
export async function transacao(trabalho) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const sql = async (texto, parametros = []) => (await cliente.query(texto, parametros)).rows;
    const resultado = await trabalho(sql);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}

// Id vindo da URL ou do corpo ("7", 7, "abc"): devolve o inteiro, ou null se não for um id
// possível. Com JSON, buscarPorId('abc') devolvia null; sem esta checagem o PostgreSQL
// recusaria o valor (erro 22P02) e a API passaria a responder 400 em vez de 404.
export function comoId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id >= 1 && id <= 2147483647 ? id : null;
}
