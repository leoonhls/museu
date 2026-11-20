-- Responsável: M7 — rascunhos da conta (usuários, favoritos, histórico).

-- Nunca selecione senha_hash à toa
SELECT id, nome, email, papel, criado_em FROM usuarios LIMIT 5;

SELECT * FROM favoritos ORDER BY criado_em DESC LIMIT 5;

-- Sessões ativas associadas a usuários; não exibe o sid nem o conteúdo da sessão.
SELECT u.nome, u.email, s.expire
  FROM sessoes s
  JOIN usuarios u ON u.id = (s.sess ->> 'usuarioId')::int
 WHERE s.expire > now()
 ORDER BY s.expire DESC;

-- Testes negativos: descomente e execute um INSERT por vez; cada um deve falhar.
-- CHECK usuarios_papel_valido:
-- INSERT INTO usuarios (nome, email, senha_hash, papel)
-- VALUES ('Conta de teste', 'teste-papel@museu.local', 'hash', 'moderador');

-- CHECK usuarios_nome_tamanho:
-- INSERT INTO usuarios (nome, email, senha_hash)
-- VALUES ('AB', 'teste-nome@museu.local', 'hash');

-- UNIQUE usuarios_email_unico (insere os dois valores na mesma instrução):
-- INSERT INTO usuarios (nome, email, senha_hash)
-- VALUES ('Ana', 'Ana@Museu.local', 'hash'), ('Ana duplicada', 'ana@museu.local', 'hash');

-- PRIMARY KEY de favoritos (executa após db:demo, com usuários e obras existentes):
-- WITH par AS (
--   SELECT u.id AS usuario_id, o.id AS obra_id
--     FROM usuarios u CROSS JOIN obras o LIMIT 1
-- )
-- INSERT INTO favoritos (usuario_id, obra_id)
-- SELECT usuario_id, obra_id FROM par CROSS JOIN generate_series(1, 2);

-- FK favoritos.usuario_id:
-- INSERT INTO favoritos (usuario_id, obra_id)
-- SELECT -1, id FROM obras LIMIT 1;

-- FK favoritos.obra_id:
-- INSERT INTO favoritos (usuario_id, obra_id)
-- SELECT id, -1 FROM usuarios LIMIT 1;
