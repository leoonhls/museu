// Responsável: M7 — veja a seção "M7" no Guia da Entrega 3
import { comoId, consultar, consultarUm } from '../db.js';

// Mais recentes primeiro.
export async function listarPorUsuario(usuarioId) {
  return consultar(
    `SELECT o.*, a.nome AS artista_nome, c.nome AS categoria_nome
       FROM favoritos f
       JOIN obras o ON o.id = f.obra_id
       JOIN artistas a ON a.id = o.artista_id
       JOIN categorias c ON c.id = o.categoria_id
      WHERE f.usuario_id = $1
      ORDER BY f.criado_em DESC`,
    [comoId(usuarioId)],
  );
}

// Não duplica: favoritar de novo não faz nada.
export async function adicionar(usuarioId, obraId) {
  const parametros = [comoId(usuarioId), comoId(obraId)];
  const favorito = await consultarUm(
    `INSERT INTO favoritos (usuario_id, obra_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    parametros,
  );
  return favorito ? { ...favorito, criado: true } : { criado: false };
}

// Devolve true se removeu, false se não era favorito.
export async function remover(usuarioId, obraId) {
  const linhas = await consultar(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND obra_id = $2 RETURNING obra_id',
    [comoId(usuarioId), comoId(obraId)],
  );
  return linhas.length > 0;
}
