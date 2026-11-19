-- Responsável: M1
CREATE EXTENSION IF NOT EXISTS unaccent;

-- O museu funciona no horário de Brasília: CURRENT_DATE, LOCALTIMESTAMP e now()
-- passam a usar esse fuso em todas as conexões novas (vale para Docker e instalação nativa).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET timezone TO %L', current_database(), 'America/Sao_Paulo');
END $$;
