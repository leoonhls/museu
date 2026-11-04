// Responsável: M1
// Acesso às "tabelas" JSON de server/data/db/. Na Entrega 3 dá lugar ao PostgreSQL.
import fs from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from '../config.js';

const caminho = (nome) => path.join(PASTA_DADOS, `${nome}.json`);

export async function lerTabela(nome) {
  return JSON.parse(await fs.readFile(caminho(nome), 'utf8'));
}

// Grava num arquivo temporário e renomeia por cima: o JSON nunca fica pela metade.
export async function gravarTabela(nome, linhas) {
  const temporario = `${caminho(nome)}.${process.pid}.tmp`;
  await fs.writeFile(temporario, JSON.stringify(linhas, null, 2) + '\n');
  await fs.rename(temporario, caminho(nome));
}

// Uma fila por tabela: alterações na mesma tabela rodam uma de cada vez, para duas
// requisições simultâneas não sobrescreverem uma à outra (garante a lotação dos eventos).
const filas = new Map();

// alterar(linhas) devolve { linhas, resultado }. Se lançar erro, nada é gravado.
export function atualizarTabela(nome, alterar) {
  const anterior = filas.get(nome) ?? Promise.resolve();
  const atual = anterior.then(async () => {
    const { linhas, resultado } = await alterar(await lerTabela(nome));
    await gravarTabela(nome, linhas);
    return resultado;
  });
  // A corrente interna ignora o erro para a fila seguir; quem chamou recebe o erro em "atual".
  filas.set(
    nome,
    atual.catch(() => {}),
  );
  return atual;
}

export function proximoId(linhas, minimo = 1) {
  return Math.max(minimo, ...linhas.map((linha) => linha.id + 1));
}
