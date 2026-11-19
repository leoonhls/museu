// Responsável: M4 — veja a seção "M4" no Guia da Entrega 3
// TODO (M4): consultas com JOIN para o detalhe da obra (artista e categoria numa consulta só).
import { comoId, consultar, consultarUm } from '../db.js';

export async function listarTodas() {
  return consultar('SELECT * FROM obras ORDER BY id');
}

export async function buscarPorId(id) {
  return consultarUm('SELECT * FROM obras WHERE id = $1', [comoId(id)]);
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
