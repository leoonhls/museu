-- Esquema da área busca (responsável: M3). Para mudar: edite este arquivo e rode npm run db:reset.
-- Índices que aceleram a busca da galeria (GET /api/obras).

-- Busca por trecho (ILIKE '%termo%') usa índice de trigramas.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- unaccent() não pode ir direto num índice (não é IMMUTABLE). Esta função fixa o
-- dicionário e passa a ser imutável: "Impressão" -> "impressao".
CREATE FUNCTION sem_acento(texto text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  RETURN lower(public.unaccent('public.unaccent'::regdictionary, texto));

-- Busca por título da obra e nome do artista, sem acento e sem diferenciar maiúsculas.
CREATE INDEX obras_titulo_busca_idx   ON obras    USING gin (sem_acento(titulo) gin_trgm_ops);
CREATE INDEX artistas_nome_busca_idx  ON artistas USING gin (sem_acento(nome) gin_trgm_ops);

-- Filtros por categoria, artista e período, e ordenação por ano.
CREATE INDEX obras_categoria_idx ON obras (categoria_id);
CREATE INDEX obras_artista_idx   ON obras (artista_id);
CREATE INDEX obras_ano_idx       ON obras (ano);
