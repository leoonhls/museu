-- Responsável: M6 — documentação e testes das reservas.

-- =====================================================
-- 1. CONSULTAS DE CONFERÊNCIA
-- =====================================================

-- Últimas reservas cadastradas.
SELECT *
FROM reservas
ORDER BY criado_em DESC
LIMIT 5;

-- Ingressos confirmados por evento.
SELECT
  evento_id,
  COALESCE(SUM(qtd_inteira + qtd_meia), 0) AS ocupadas
FROM reservas
WHERE status = 'confirmada'
  AND evento_id IS NOT NULL
GROUP BY evento_id;

-- Verificar as restrições da tabela reservas.
SELECT
  conname AS restricao,
  pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = 'reservas'::regclass
ORDER BY conname;

-- Verificar os índices da tabela reservas.
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reservas'
ORDER BY indexname;

-- =====================================================
-- 2. TESTES DAS RESTRIÇÕES DE INTEGRIDADE
-- =====================================================
-- Os testes abaixo tentam inserir dados inválidos.
-- Cada erro esperado é capturado pelo bloco EXCEPTION.
-- Nenhum registro inválido permanece no banco.

-- 2.1 Código duplicado.
DO $$
DECLARE
  codigo_existente text;
  usuario_existente integer;
BEGIN
  SELECT codigo INTO codigo_existente
  FROM reservas
  LIMIT 1;

  SELECT id INTO usuario_existente
  FROM usuarios
  LIMIT 1;

  IF codigo_existente IS NULL OR usuario_existente IS NULL THEN
    RAISE EXCEPTION 'É necessário haver ao menos uma reserva e um usuário.';
  END IF;

  BEGIN
    INSERT INTO reservas (
      codigo, usuario_id, data_visita,
      qtd_inteira, qtd_meia, valor_total, status
    )
    VALUES (
      codigo_existente, usuario_existente, CURRENT_DATE,
      1, 0, 0, 'confirmada'
    );

    RAISE EXCEPTION 'FALHA: código duplicado foi aceito.';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'OK: código duplicado foi rejeitado.';
  END;
END $$;

-- 2.2 Status inválido.
DO $$
BEGIN
  BEGIN
    INSERT INTO reservas (
      codigo, usuario_id, data_visita,
      qtd_inteira, qtd_meia, valor_total, status
    )
    VALUES (
      'TESTE-STATUS-INVALIDO', 1, CURRENT_DATE,
      1, 0, 0, 'invalido'
    );

    RAISE EXCEPTION 'FALHA: status inválido foi aceito.';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'OK: status inválido foi rejeitado.';
  END;
END $$;

-- 2.3 Quantidade negativa.
DO $$
BEGIN
  BEGIN
    INSERT INTO reservas (
      codigo, usuario_id, data_visita,
      qtd_inteira, qtd_meia, valor_total, status
    )
    VALUES (
      'TESTE-QTD-NEGATIVA', 1, CURRENT_DATE,
      -1, 2, 0, 'confirmada'
    );

    RAISE EXCEPTION 'FALHA: quantidade negativa foi aceita.';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'OK: quantidade negativa foi rejeitada.';
  END;
END $$;

-- 2.4 Total acima de 10 ingressos.
DO $$
BEGIN
  BEGIN
    INSERT INTO reservas (
      codigo, usuario_id, data_visita,
      qtd_inteira, qtd_meia, valor_total, status
    )
    VALUES (
      'TESTE-TOTAL-ACIMA', 1, CURRENT_DATE,
      11, 0, 0, 'confirmada'
    );

    RAISE EXCEPTION 'FALHA: total acima de 10 foi aceito.';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'OK: total acima de 10 foi rejeitado.';
  END;
END $$;

-- 2.5 Valor total negativo.
DO $$
BEGIN
  BEGIN
    INSERT INTO reservas (
      codigo, usuario_id, data_visita,
      qtd_inteira, qtd_meia, valor_total, status
    )
    VALUES (
      'TESTE-VALOR-NEGATIVO', 1, CURRENT_DATE,
      1, 0, -1, 'confirmada'
    );

    RAISE EXCEPTION 'FALHA: valor negativo foi aceito.';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'OK: valor negativo foi rejeitado.';
  END;
END $$;

-- Conferência dos dados atuais após os testes.
SELECT
  COUNT(*) AS total_reservas,
  COUNT(*) FILTER (WHERE status = 'confirmada') AS confirmadas,
  COUNT(*) FILTER (WHERE status = 'cancelada') AS canceladas
FROM reservas;

-- =====================================================
-- 3. TESTE DE CONCORRÊNCIA
-- =====================================================

-- ANTES:
-- Sem bloqueio da linha do evento, duas transações
-- poderiam consultar simultaneamente a mesma capacidade,
-- ambas considerar as vagas disponíveis e inserir reservas
-- acima do limite.

-- DEPOIS:
-- Com SELECT ... FOR UPDATE na linha do evento,
-- a primeira transação bloqueia o evento.
-- A segunda aguarda a liberação do bloqueio.
-- Após o COMMIT da primeira, a segunda consulta novamente
-- as reservas confirmadas e encontra a capacidade atualizada.

-- Resultado observado no teste-lotacao.js:
-- 10 requisições simultâneas para o evento 2.
-- 5 respostas HTTP 201 (reservas aprovadas).
-- 5 respostas HTTP 400 (reservas recusadas).
-- Limite de 5 vagas respeitado.