-- Responsável: M5 — rascunhos da agenda (exposições e eventos).

SELECT * FROM exposicoes ORDER BY data_inicio;

-- Status das exposições
SELECT e.*,
       CASE
         WHEN CURRENT_DATE < e.data_inicio THEN 'futura'
         WHEN CURRENT_DATE > e.data_fim THEN 'passada'
         ELSE 'atual'
       END AS status
  FROM exposicoes e;

-- Próximos eventos com vagas restantes
SELECT ev.*,
       GREATEST(0, ev.capacidade - COALESCE(r.ocupadas, 0)) AS vagas_restantes
  FROM eventos ev
  LEFT JOIN (
    SELECT evento_id, SUM(qtd_inteira + qtd_meia) AS ocupadas
      FROM reservas
     WHERE status = 'confirmada'
     GROUP BY evento_id
  ) r ON r.evento_id = ev.id
 WHERE ev.data_hora >= LOCALTIMESTAMP
 ORDER BY ev.data_hora
 LIMIT 5;

-- Deve falhar: periodo invalido
-- INSERT INTO exposicoes (titulo, data_inicio, data_fim) VALUES ('Teste', '2026-12-31', '2026-01-01');

-- Deve falhar: vinculo com exposicao/obra inexistente
-- INSERT INTO exposicao_obras (exposicao_id, obra_id) VALUES (999999, 999999);

-- Deve falhar: capacidade invalida
-- INSERT INTO eventos (titulo, data_hora, capacidade) VALUES ('Teste', LOCALTIMESTAMP, 0);

-- Deve falhar: preco invalido
-- INSERT INTO eventos (titulo, data_hora, capacidade, preco) VALUES ('Teste', LOCALTIMESTAMP, 10, -1);
