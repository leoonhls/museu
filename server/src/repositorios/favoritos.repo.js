// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import { atualizarTabela, lerTabela } from './base-json.js';

// Mais recentes primeiro.
export async function listarPorUsuario(usuarioId) {
  return (await lerTabela('favoritos'))
    .filter((favorito) => favorito.usuario_id === Number(usuarioId))
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
}

// Não duplica: favoritar de novo não faz nada.
export async function adicionar(usuarioId, obraId) {
  return atualizarTabela('favoritos', (linhas) => {
    const existente = linhas.find(
      (f) => f.usuario_id === Number(usuarioId) && f.obra_id === Number(obraId),
    );
    if (existente) return { linhas, resultado: existente };
    const favorito = {
      usuario_id: Number(usuarioId),
      obra_id: Number(obraId),
      criado_em: new Date().toISOString(),
    };
    return { linhas: [...linhas, favorito], resultado: favorito };
  });
}

export async function remover(usuarioId, obraId) {
  return atualizarTabela('favoritos', (linhas) => ({
    linhas: linhas.filter(
      (f) => !(f.usuario_id === Number(usuarioId) && f.obra_id === Number(obraId)),
    ),
    resultado: undefined,
  }));
}

export async function excluirPorObra(obraId) {
  return atualizarTabela('favoritos', (linhas) => ({
    linhas: linhas.filter((f) => f.obra_id !== Number(obraId)),
    resultado: undefined,
  }));
}
