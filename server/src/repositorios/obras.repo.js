// Responsável: M4 — veja a seção "M4" no Guia da Entrega 2
import { atualizarTabela, lerTabela, proximoId } from './base-json.js';

export async function listarTodas() {
  return lerTabela('obras');
}

export async function buscarPorId(id) {
  return (await lerTabela('obras')).find((obra) => obra.id === Number(id)) ?? null;
}

// Obras criadas pelo admin começam no id 1000, para não colidir com o acervo do seed.
export async function criar(dados) {
  return atualizarTabela('obras', (linhas) => {
    const obra = {
      ...dados,
      id: proximoId(linhas, 1000),
      criado_em: new Date().toISOString().slice(0, 10),
    };
    return { linhas: [...linhas, obra], resultado: obra };
  });
}

// Devolve a obra atualizada, ou null se não existir.
export async function atualizar(id, dados) {
  return atualizarTabela('obras', (linhas) => {
    const indice = linhas.findIndex((obra) => obra.id === Number(id));
    if (indice === -1) return { linhas, resultado: null };
    const obra = { ...linhas[indice], ...dados, id: linhas[indice].id };
    const novas = [...linhas];
    novas[indice] = obra;
    return { linhas: novas, resultado: obra };
  });
}

// Devolve true se excluiu, false se não existia.
export async function excluir(id) {
  return atualizarTabela('obras', (linhas) => {
    const restantes = linhas.filter((obra) => obra.id !== Number(id));
    return { linhas: restantes, resultado: restantes.length !== linhas.length };
  });
}
