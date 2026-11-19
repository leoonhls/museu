-- Responsável: M3 — rascunhos da busca da galeria.

SELECT * FROM obras LIMIT 5;

-- Busca sem acento (extensão unaccent)
SELECT id, titulo FROM obras WHERE unaccent(titulo) ILIKE unaccent('%impressao%');
