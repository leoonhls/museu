-- Esquema da área busca (responsável: M3). Para mudar: edite este arquivo e rode npm run db:reset.
-- Índices que aceleram os filtros da galeria (GET /api/obras). Um índice é como o índice
-- remissivo de um livro: o banco vai direto às linhas certas em vez de ler a tabela inteira.
-- Com só 40 obras o ganho é pequeno; o experimento com 10 mil obras está registrado em
-- docs/sql/galeria.sql.

-- ?categoria=  ->  WHERE o.categoria_id = $n
CREATE INDEX obras_categoria_idx ON obras (categoria_id);

-- ?artista=    ->  WHERE o.artista_id = $n  (também acelera o JOIN e o "obras do artista" do M4)
CREATE INDEX obras_artista_idx ON obras (artista_id);

-- ?anoMin= / ?anoMax= / ordem antigas e recentes  ->  WHERE o.ano >= $n AND o.ano <= $m, ORDER BY o.ano
CREATE INDEX obras_ano_idx ON obras (ano);
