-- Esquema da área sessões (responsável: M1). Para mudar: edite este arquivo e rode npm run db:reset.
CREATE TABLE sessoes (
  sid    varchar NOT NULL PRIMARY KEY,
  sess   json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX sessoes_expire_idx ON sessoes (expire);
