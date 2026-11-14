// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import { atualizarTabela, gravarTabela, lerTabela } from './base-json.js';

let tabelaInicializada;

async function garantirTabela() {
  tabelaInicializada ??= (async () => {
    try {
      await lerTabela('historico_conta');
    } catch (erro) {
      if (erro.code !== 'ENOENT') throw erro;
      await gravarTabela('historico_conta', []);
    }
  })();
  await tabelaInicializada;
}

export async function listarPorUsuario(usuarioId) {
  await garantirTabela();
  return (await lerTabela('historico_conta'))
    .filter((item) => item.usuario_id === Number(usuarioId))
    .sort((a, b) => b.data_hora.localeCompare(a.data_hora))
    .slice(0, 50)
    .map(({ tipo, descricao, data_hora }) => ({ tipo, descricao, data_hora }));
}

export async function registrar(usuarioId, tipo, descricao) {
  await garantirTabela();
  return atualizarTabela('historico_conta', (linhas) => ({
    linhas: [
      ...linhas,
      { usuario_id: Number(usuarioId), tipo, descricao, data_hora: new Date().toISOString() },
    ].slice(-1000),
    resultado: undefined,
  }));
}
