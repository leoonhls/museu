// Responsável: M4 — veja a seção "M4" no Guia da Entrega 3
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodas() {
  return consultar('SELECT * FROM obras ORDER BY id');
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM obras WHERE id = $1', [comoId(id)]);
}

export async function buscarDetalhe(id) {
  const obraId = comoId(id);
  const obra = await consultarUm(
    `SELECT o.*,
            a.nome AS artista_nome,
            c.nome AS categoria_nome,
            row_to_json(a.*) AS artista,
            row_to_json(c.*) AS categoria
       FROM obras o
       JOIN artistas a ON a.id = o.artista_id
       JOIN categorias c ON c.id = o.categoria_id
      WHERE o.id = $1`,
    [obraId],
  );
  if (!obra) return null;

  const exposicoes = await consultar(
    `SELECT e.id, e.titulo, e.data_inicio, e.data_fim
       FROM exposicoes e
       JOIN exposicao_obras eo ON eo.exposicao_id = e.id
      WHERE eo.obra_id = $1
      ORDER BY e.data_inicio`,
    [obraId],
  );

  return { ...obra, exposicoes };
}

export async function listarPorArtista(artistaId) {
  return consultar(
    `SELECT o.*,
            a.nome AS artista_nome,
            c.nome AS categoria_nome
       FROM obras o
       JOIN artistas a ON a.id = o.artista_id
       JOIN categorias c ON c.id = o.categoria_id
      WHERE o.artista_id = $1
      ORDER BY o.id`,
    [comoId(artistaId)],
  );
}

// O id é gerado pelo banco.
export async function criar(dados) {
  return consultarUm(
    `INSERT INTO obras (titulo, artista_id, categoria_id, ano, tecnica, dimensoes, descricao, imagem_url, em_exibicao)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      dados.titulo,
      dados.artista_id,
      dados.categoria_id,
      dados.ano,
      dados.tecnica,
      dados.dimensoes ?? null,
      dados.descricao,
      dados.imagem_url,
      dados.em_exibicao ?? false,
    ],
  );
}

// Devolve a obra atualizada, ou null se não existir.
export async function atualizar(id, dados) {
  return consultarUm(
    `UPDATE obras
        SET titulo = $2, artista_id = $3, categoria_id = $4, ano = $5, tecnica = $6,
            dimensoes = $7, descricao = $8, imagem_url = $9, em_exibicao = $10
      WHERE id = $1
      RETURNING *`,
    [
      comoId(id),
      dados.titulo,
      dados.artista_id,
      dados.categoria_id,
      dados.ano,
      dados.tecnica,
      dados.dimensoes ?? null,
      dados.descricao,
      dados.imagem_url,
      dados.em_exibicao ?? false,
    ],
  );
}

// Devolve true se excluiu, false se não existia.
export async function excluir(id) {
  const linhas = await consultar('DELETE FROM obras WHERE id = $1 RETURNING id', [comoId(id)]);
  return linhas.length > 0;
}
