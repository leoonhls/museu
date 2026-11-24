-- Responsável: M3 — rascunhos da busca da galeria (GET /api/obras).
-- No SQLTools: selecione um bloco e aperte Ctrl+E Ctrl+E.
-- Os valores fixos abaixo ocupam o lugar dos $1, $2... que o busca-obras.repo.js usa.

-- =====================================================================
-- 1. A consulta da galeria, como o repositório monta
-- =====================================================================

-- Sem filtros: página 1, ordem por título (LIMIT 12 OFFSET 0)
SELECT o.id, o.titulo, o.ano, a.nome AS artista_nome, c.nome AS categoria_nome,
       COUNT(*) OVER() AS total
  FROM obras o
  JOIN artistas a ON a.id = o.artista_id
  JOIN categorias c ON c.id = o.categoria_id
 ORDER BY o.titulo COLLATE "pt-BR-x-icu" ASC, o.id
 LIMIT 12 OFFSET 0;

-- Todos os filtros juntos ($1 = busca, $2 = categoria, $3 = anoMin, $4 = anoMax),
-- ordem "recentes", página 2 (OFFSET 12)
SELECT o.id, o.titulo, o.ano, a.nome AS artista_nome, c.nome AS categoria_nome,
       COUNT(*) OVER() AS total
  FROM obras o
  JOIN artistas a ON a.id = o.artista_id
  JOIN categorias c ON c.id = o.categoria_id
 WHERE (unaccent(o.titulo) ILIKE unaccent('%' || 'a' || '%')
        OR unaccent(a.nome) ILIKE unaccent('%' || 'a' || '%'))
   AND o.categoria_id = 1
   AND o.ano >= 1800
   AND o.ano <= 1900
 ORDER BY o.ano DESC, o.titulo COLLATE "pt-BR-x-icu" ASC, o.id
 LIMIT 12 OFFSET 12;

-- Busca sem acento e sem maiúsculas: "IMPRESSAO" acha "Impressão, Sol Nascente"
SELECT id, titulo FROM obras WHERE unaccent(titulo) ILIKE unaccent('%IMPRESSAO%');

-- Busca pelo nome do artista: "monet" traz as 3 obras de Claude Monet
SELECT o.titulo, a.nome
  FROM obras o JOIN artistas a ON a.id = o.artista_id
 WHERE unaccent(o.titulo) ILIKE unaccent('%monet%') OR unaccent(a.nome) ILIKE unaccent('%monet%');

-- Por que o repositório escapa % e _ antes de mandar a busca:
-- no ILIKE, % é "qualquer texto" e _ é "qualquer letra".
SELECT count(*) FROM obras WHERE titulo ILIKE '%' || '_' || '%';    -- 40: o _ casa com tudo
SELECT count(*) FROM obras WHERE titulo ILIKE '%' || '\_' || '%';   -- 0: procura o _ de verdade

-- =====================================================================
-- 2. COUNT(*) OVER(): o total sem uma segunda consulta
-- =====================================================================

-- O total (22 pinturas) se repete em cada linha, mesmo com LIMIT 3
SELECT o.titulo, COUNT(*) OVER() AS total
  FROM obras o WHERE o.categoria_id = 1
 ORDER BY o.titulo COLLATE "pt-BR-x-icu"
 LIMIT 3;

-- Página além do fim: nenhuma linha volta, e o total vai junto...
SELECT o.titulo, COUNT(*) OVER() AS total
  FROM obras o WHERE o.categoria_id = 1
 ORDER BY o.titulo LIMIT 12 OFFSET 588;   -- página 50

-- ...por isso o repositório faz uma segunda consulta, só nesse caso, com o mesmo WHERE
SELECT COUNT(*) AS total FROM obras o WHERE o.categoria_id = 1;

-- =====================================================================
-- 3. Por que COLLATE "pt-BR-x-icu" no ORDER BY
-- =====================================================================
-- A ordem padrão de texto depende do sistema operacional onde o banco roda. No macOS, por
-- exemplo, a collation en_US.UTF-8 ordena pelos bytes: maiúsculas antes de minúsculas e
-- letras acentuadas depois do "z". A collation ICU pt-BR ordena como o localeCompare('pt-BR')
-- do JavaScript (Entrega 2), igual em qualquer computador.
SELECT t FROM (VALUES ('Órion'), ('abacate'), ('Zebra'), ('Árvore'), ('ônibus')) v(t) ORDER BY t COLLATE "C";
SELECT t FROM (VALUES ('Órion'), ('abacate'), ('Zebra'), ('Árvore'), ('ônibus')) v(t) ORDER BY t COLLATE "pt-BR-x-icu";

-- =====================================================================
-- 4. Índices: o experimento com EXPLAIN ANALYZE
-- =====================================================================
-- Os índices ficam em server/db/esquema/60_indices_busca.sql:
--   obras_categoria_idx (categoria_id), obras_artista_idx (artista_id), obras_ano_idx (ano)

-- Ver os índices da tabela
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'obras';

-- O experimento roda numa transação e termina com ROLLBACK: o banco volta como estava.
-- Rode o bloco inteiro de uma vez.
BEGIN;

EXPLAIN ANALYZE SELECT * FROM obras WHERE categoria_id = 2;   -- 40 obras, com índice

DROP INDEX obras_categoria_idx;
DROP INDEX obras_artista_idx;
DROP INDEX obras_ano_idx;

-- 10 mil obras falsas
INSERT INTO obras (titulo, artista_id, categoria_id, ano, tecnica, descricao, imagem_url)
SELECT 'Obra falsa ' || n, 1 + n % 15, 1 + n % 5, 1400 + n % 600, 'Teste',
       'Descrição gerada para o teste de índices.', '/assets/img/obras/falsa.jpg'
  FROM generate_series(1, 10000) AS n;
ANALYZE obras;   -- atualiza as estatísticas que o planejador usa para escolher o caminho

EXPLAIN ANALYZE SELECT * FROM obras WHERE categoria_id = 2;              -- sem índice
EXPLAIN ANALYZE SELECT * FROM obras WHERE ano BETWEEN 1500 AND 1510;     -- sem índice

CREATE INDEX obras_categoria_idx ON obras (categoria_id);
CREATE INDEX obras_artista_idx ON obras (artista_id);
CREATE INDEX obras_ano_idx ON obras (ano);
ANALYZE obras;

EXPLAIN ANALYZE SELECT * FROM obras WHERE categoria_id = 2;              -- com índice
EXPLAIN ANALYZE SELECT * FROM obras WHERE ano BETWEEN 1500 AND 1510;     -- com índice

ROLLBACK;

-- O QUE EU OBSERVEI (PostgreSQL 18, Homebrew, macOS; 20/11/2026)
--
-- | Situação                     | Consulta                 | Plano                       | Linhas lidas e descartadas | Tempo    |
-- |------------------------------|--------------------------|-----------------------------|----------------------------|----------|
-- | 40 obras, com índice         | categoria_id = 2         | Bitmap Index Scan (índice)  | 0                          | 0,08 ms  |
-- | 10.040 obras, SEM índice     | categoria_id = 2         | Seq Scan (tabela inteira)   | 8.034                      | 0,41 ms  |
-- | 10.040 obras, SEM índice     | ano BETWEEN 1500 e 1510  | Seq Scan (tabela inteira)   | 9.851                      | 0,36 ms  |
-- | 10.040 obras, COM índice     | categoria_id = 2         | Bitmap Index Scan (índice)  | 0                          | 0,15 ms  |
-- | 10.040 obras, COM índice     | ano BETWEEN 1500 e 1510  | Bitmap Index Scan (índice)  | 0                          | 0,02 ms  |
--
-- 1. Sem índice, o banco lê as 10.040 linhas e joga fora as que não servem
--    ("Rows Removed by Filter: 9851"). Com índice, ele vai direto às linhas certas.
-- 2. O ganho é maior quanto MENOS linhas o filtro devolve: o ano (189 de 10.040, ~2%) ficou
--    ~17x mais rápido (0,36 -> 0,02 ms); a categoria (2.006 de 10.040, 20%) ficou ~2,7x.
--    Se o filtro trouxesse quase a tabela toda, ler tudo em sequência seria mais barato, e o
--    planejador escolheria o Seq Scan mesmo com o índice.
-- 3. O guia previa Seq Scan com 40 obras. Aqui o planejador usou o índice mesmo assim: as
--    linhas são largas (a descrição é longa), então as 40 obras ocupam várias páginas do
--    disco, e pular para as 6 certas sai mais barato. Num PostgreSQL 16 (Docker), o
--    resultado pode ser outro. Quem decide é o planejador, pelo custo estimado, e não nós.
-- 4. A busca por texto (ILIKE '%monet%') NÃO usa esses índices. Com o % no começo, um índice
--    comum (B-tree) não ajuda, porque ele só acha textos pelo começo. Para isso existiria
--    a extensão pg_trgm (índice GIN de trigramas). Com 40 obras, não vale a complexidade.
