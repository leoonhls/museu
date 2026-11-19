-- Responsável: M5 — rascunhos da agenda (exposições e eventos).

SELECT * FROM exposicoes ORDER BY data_inicio;

-- Próximos eventos (data_hora é a hora local do museu: compare com LOCALTIMESTAMP)
SELECT * FROM eventos WHERE data_hora >= LOCALTIMESTAMP ORDER BY data_hora LIMIT 5;
