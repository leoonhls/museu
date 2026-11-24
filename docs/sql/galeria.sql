-- Responsável: M3 — consultas da busca da galeria (GET /api/obras).
-- A consulta da aplicação está em server/src/repositorios/busca-obras.repo.js;
-- os índices e a função sem_acento() em server/db/esquema/60_indices_busca.sql.

-- 1. Busca sem acento e sem diferenciar maiúsculas, no título ou no nome do artista
SELECT o.id, o.titulo, a.nome AS artista_nome
FROM obras o
LEFT JOIN artistas a ON a.id = o.artista_id
WHERE sem_acento(o.titulo) LIKE '%' || sem_acento('IMPRESSÃO') || '%'
   OR sem_acento(a.nome)   LIKE '%' || sem_acento('IMPRESSÃO') || '%';

-- 2. Filtros combinados + ordem + página 1 (12 por página) + total da lista filtrada
SELECT o.id, o.titulo, o.ano, COUNT(*) OVER() AS total
FROM obras o
WHERE o.categoria_id = 1
  AND o.ano BETWEEN 1800 AND 1900
ORDER BY o.ano DESC, o.titulo, o.id
LIMIT 12 OFFSET 0;

-- 3. Página além do fim: não volta linha nenhuma, por isso o total é contado à parte
SELECT COUNT(*) AS total FROM obras o WHERE o.categoria_id = 1;

-- 4. Conferir que a busca usa o índice de trigramas (com poucas obras o planejador
--    prefere ler a tabela inteira; desligar o seqscan só para ver o plano)
SET enable_seqscan = off;
EXPLAIN SELECT id FROM obras WHERE sem_acento(titulo) LIKE '%noite%';
RESET enable_seqscan;
