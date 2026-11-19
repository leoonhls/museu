// Responsável: M7 — veja a seção "M7" no Guia da Entrega 3
// TODO (M7): trocar a checagem do adicionar por INSERT ... ON CONFLICT DO NOTHING.
import { comoId, consultar, consultarUm } from '../db.js';

// Mais recentes primeiro.
export async function listarPorUsuario(usuarioId) {
  return consultar('SELECT * FROM favoritos WHERE usuario_id = $1 ORDER BY criado_em DESC', [
    comoId(usuarioId),
  ]);
}

// Não duplica: favoritar de novo não faz nada.
export async function adicionar(usuarioId, obraId) {
  const parametros = [comoId(usuarioId), comoId(obraId)];
  const existente = await consultarUm(
    'SELECT * FROM favoritos WHERE usuario_id = $1 AND obra_id = $2',
    parametros,
  );
  if (existente) return { ...existente, criado: false };
  const favorito = await consultarUm(
    'INSERT INTO favoritos (usuario_id, obra_id) VALUES ($1, $2) RETURNING *',
    parametros,
  );
  return { ...favorito, criado: true };
}

// Devolve true se removeu, false se não era favorito.
export async function remover(usuarioId, obraId) {
  const linhas = await consultar(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND obra_id = $2 RETURNING obra_id',
    [comoId(usuarioId), comoId(obraId)],
  );
  return linhas.length > 0;
}

export async function excluirPorObra(obraId) {
  await consultar('DELETE FROM favoritos WHERE obra_id = $1', [comoId(obraId)]);
}
