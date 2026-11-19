-- Responsável: M6 — rascunhos das reservas.

SELECT * FROM reservas ORDER BY criado_em DESC LIMIT 5;

-- Ingressos confirmados por evento
SELECT evento_id, COALESCE(SUM(qtd_inteira + qtd_meia), 0) AS ocupadas
  FROM reservas
 WHERE status = 'confirmada' AND evento_id IS NOT NULL
 GROUP BY evento_id;
