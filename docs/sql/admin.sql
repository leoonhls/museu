-- Responsável: M8 — rascunhos do admin.

SELECT id, titulo, criado_em FROM obras ORDER BY criado_em DESC LIMIT 5;

-- Onde uma obra é usada (antes de excluir)
SELECT 'exposicao_obras' AS tabela, COUNT(*) FROM exposicao_obras WHERE obra_id = 1
UNION ALL
SELECT 'favoritos', COUNT(*) FROM favoritos WHERE obra_id = 1;
