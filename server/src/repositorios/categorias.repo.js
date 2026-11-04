// Responsável: M4 — veja a seção "M4" no Guia da Entrega 2
import { lerTabela } from './base-json.js';

export async function listarTodas() {
  return lerTabela('categorias');
}

export async function buscarPorId(id) {
  return (await lerTabela('categorias')).find((categoria) => categoria.id === Number(id)) ?? null;
}
