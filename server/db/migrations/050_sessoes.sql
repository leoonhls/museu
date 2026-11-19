-- Responsável: M1
CREATE TABLE sessoes (
  sid    varchar NOT NULL PRIMARY KEY,
  sess   json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX sessoes_expire_idx ON sessoes (expire);
