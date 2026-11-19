-- Responsável: M2 — rascunhos da home (destaques). Rode no SQLTools (conexão "Museu (local)").

-- Obras em exibição
SELECT id, titulo, artista_id FROM obras WHERE em_exibicao ORDER BY id LIMIT 6;

-- Exposição em cartaz hoje
SELECT * FROM exposicoes WHERE CURRENT_DATE BETWEEN data_inicio AND data_fim;
