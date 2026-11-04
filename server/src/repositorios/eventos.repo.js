// Responsável: M5 — veja a seção "M5" no Guia da Entrega 2
import { lerTabela } from './base-json.js';

export async function listarTodos() {
  return lerTabela('eventos');
}

export async function buscarPorId(id) {
  return (await lerTabela('eventos')).find((evento) => evento.id === Number(id)) ?? null;
}

export async function listarPorExposicao(exposicaoId) {
  return (await lerTabela('eventos')).filter((evento) => evento.exposicao_id === Number(exposicaoId));
}
