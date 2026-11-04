// Responsável: M5 — veja a seção "M5" no Guia da Entrega 2
import { atualizarTabela, lerTabela } from './base-json.js';

export async function listarPorExposicao(exposicaoId) {
  return (await lerTabela('exposicao_obras')).filter((eo) => eo.exposicao_id === Number(exposicaoId));
}

export async function listarPorObra(obraId) {
  return (await lerTabela('exposicao_obras')).filter((eo) => eo.obra_id === Number(obraId));
}

export async function excluirPorObra(obraId) {
  return atualizarTabela('exposicao_obras', (linhas) => ({
    linhas: linhas.filter((eo) => eo.obra_id !== Number(obraId)),
    resultado: undefined,
  }));
}
