-- Responsável: M7 — rascunhos da conta (usuários, favoritos, histórico).

-- Nunca selecione senha_hash à toa
SELECT id, nome, email, papel, criado_em FROM usuarios LIMIT 5;

SELECT * FROM favoritos ORDER BY criado_em DESC LIMIT 5;
