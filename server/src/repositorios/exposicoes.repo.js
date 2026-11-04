// Responsável: M5 — veja a seção "M5" no Guia da Entrega 2
import { lerTabela } from './base-json.js';

export async function listarTodas() {
  return lerTabela('exposicoes');
}

export async function buscarPorId(id) {
  return (await lerTabela('exposicoes')).find((exposicao) => exposicao.id === Number(id)) ?? null;
}
