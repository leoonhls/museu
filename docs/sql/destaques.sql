-- Responsável: M2 — consultas da home (destaques).
-- Rode no SQLTools (conexão "Museu (local)", selecionando o bloco e usando Ctrl+E Ctrl+E).

-- 1. Exposição em cartaz hoje (se houver mais de uma, a que termina primeiro)
SELECT *
FROM exposicoes
WHERE CURRENT_DATE BETWEEN data_inicio AND data_fim
ORDER BY data_fim ASC, id ASC
LIMIT 1;

-- 2. Até 6 obras em destaque (priorizando as que estão em exibição, com nome do artista e categoria)
SELECT o.*,
       a.nome AS artista_nome,
       c.nome AS categoria_nome
FROM obras o
JOIN artistas a ON a.id = o.artista_id
JOIN categorias c ON c.id = o.categoria_id
ORDER BY o.em_exibicao DESC, o.id ASC
LIMIT 6;

-- 3. Próximos 3 eventos com vagas restantes:
-- Reaproveitar a função do M5 na aplicação/repositório em vez de duplicar a consulta aqui.
