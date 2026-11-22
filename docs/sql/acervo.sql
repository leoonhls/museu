-- Responsável: M4 — rascunhos do acervo (obras, artistas, categorias).

SELECT * FROM obras LIMIT 5;

-- Obra com o nome do artista e da categoria
SELECT o.id, o.titulo, a.nome AS artista_nome, c.nome AS categoria_nome
  FROM obras o
  JOIN artistas a ON a.id = o.artista_id
  JOIN categorias c ON c.id = o.categoria_id
 WHERE o.id = 1;

-- =====================================================================
-- Testes das restrições (todos abaixo DEVEM falhar ao rodar no banco)
-- =====================================================================

-- deve falhar: categorias_nome_unico ('Pintura' já existe no seed)
INSERT INTO categorias (nome)
VALUES ('Pintura');

-- deve falhar: artistas_anos_validos (ano_falecimento < ano_nascimento)
INSERT INTO artistas (nome, ano_nascimento, ano_falecimento)
VALUES ('Artista Teste', 1900, 1850);

-- deve falhar: obras_titulo_tamanho (título vazio, menor que 1 caractere)
INSERT INTO obras (titulo, artista_id, categoria_id, ano, tecnica, descricao, imagem_url)
VALUES ('', 1, 1, 2000, 'Óleo', 'Uma descrição com mais de vinte letras.', '/assets/img/x.jpg');

-- deve falhar: obras_ano_valido (ano <= 0)
INSERT INTO obras (titulo, artista_id, categoria_id, ano, tecnica, descricao, imagem_url)
VALUES ('Teste', 1, 1, -5, 'Óleo', 'Uma descrição com mais de vinte letras.', '/assets/img/x.jpg');

-- deve falhar: obras_descricao_tamanho (descrição com menos de 20 caracteres)
INSERT INTO obras (titulo, artista_id, categoria_id, ano, tecnica, descricao, imagem_url)
VALUES ('Teste', 1, 1, 2000, 'Óleo', 'Curta demais.', '/assets/img/x.jpg');

-- deve falhar: obras_imagem_url_valida (não começa com '/assets/img/' nem 'https://')
INSERT INTO obras (titulo, artista_id, categoria_id, ano, tecnica, descricao, imagem_url)
VALUES ('Teste', 1, 1, 2000, 'Óleo', 'Uma descrição com mais de vinte letras.', 'http://inseguro.com/x.jpg');

-- deve falhar: violates foreign key (artista com obras — ON DELETE RESTRICT)
DELETE FROM artistas WHERE id = 1;

-- deve falhar: violates foreign key (categoria com obras — ON DELETE RESTRICT)
DELETE FROM categorias WHERE id = 1;
