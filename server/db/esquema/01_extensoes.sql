-- Esquema da área extensões (responsável: M1). Para mudar: edite este arquivo e rode npm run db:reset.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- O museu funciona no horário de Brasília: CURRENT_DATE, LOCALTIMESTAMP e now()
-- passam a usar esse fuso em todas as conexões novas (vale para Docker e instalação nativa).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET timezone TO %L', current_database(), 'America/Sao_Paulo');
END $$;
