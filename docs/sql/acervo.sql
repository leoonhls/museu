-- Responsável: M4 — rascunhos do acervo (obras, artistas, categorias).

SELECT * FROM obras LIMIT 5;

-- Obra com o nome do artista e da categoria
SELECT o.id, o.titulo, a.nome AS artista_nome, c.nome AS categoria_nome
  FROM obras o
  JOIN artistas a ON a.id = o.artista_id
  JOIN categorias c ON c.id = o.categoria_id
 WHERE o.id = 1;
