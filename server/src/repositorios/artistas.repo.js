// Responsável: M4 — veja a seção "M4" no Guia da Entrega 2
import { lerTabela } from './base-json.js';

export async function listarTodos() {
  return lerTabela('artistas');
}

export async function buscarPorId(id) {
  return (await lerTabela('artistas')).find((artista) => artista.id === Number(id)) ?? null;
}
