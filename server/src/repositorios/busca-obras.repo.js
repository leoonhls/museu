// Responsável: M3 — veja a seção "M3" no Guia da Entrega 3
// Busca da galeria feita toda no PostgreSQL: WHERE (sem acento), ORDER BY, LIMIT/OFFSET
// e o total da lista filtrada com COUNT(*) OVER().
import { consultar, consultarUm } from '../db.js';

export const POR_PAGINA = 12;

// Valores fixos (nunca vêm do usuário): o service só aceita estas três ordens.
// Empate de ano desempata pelo título, e o id garante a mesma ordem entre as páginas.
const ORDER_BY = {
  titulo: 'o.titulo, o.id',
  antigas: 'o.ano, o.titulo, o.id',
  recentes: 'o.ano DESC, o.titulo, o.id',
};

// Filtro opcional: parâmetro NULL desliga a condição. sem_acento() está em 60_indices_busca.sql.
const FROM_WHERE = `
    FROM obras o
    LEFT JOIN artistas a ON a.id = o.artista_id
    LEFT JOIN categorias c ON c.id = o.categoria_id
   WHERE ($1::text IS NULL OR sem_acento(o.titulo) LIKE '%' || sem_acento($1) || '%'
                           OR sem_acento(a.nome)   LIKE '%' || sem_acento($1) || '%')
     AND ($2::integer IS NULL OR o.categoria_id = $2)
     AND ($3::integer IS NULL OR o.artista_id = $3)
     AND ($4::integer IS NULL OR o.ano >= $4)
     AND ($5::integer IS NULL OR o.ano <= $5)`;

// Recebe valores JÁ VALIDADOS pelo service (números ou undefined, ordem conhecida).
// Devolve { dados, total }: dados são só os itens da página; total é o tamanho da lista filtrada.
export async function buscarComFiltros({
  busca,
  categoria,
  artista,
  anoMin,
  anoMax,
  ordem = 'titulo',
  pagina = 1,
} = {}) {
  // O % e o _ digitados pelo visitante são texto comum, não curingas do LIKE.
  const termo = busca ? busca.replace(/[\\%_]/g, '\\$&') : null;
  const filtros = [termo, categoria ?? null, artista ?? null, anoMin ?? null, anoMax ?? null];

  const linhas = await consultar(
    `SELECT o.*, a.nome AS artista_nome, c.nome AS categoria_nome,
            COUNT(*) OVER() AS total
     ${FROM_WHERE}
     ORDER BY ${ORDER_BY[ordem] ?? ORDER_BY.titulo}
     LIMIT $6 OFFSET $7`,
    [...filtros, POR_PAGINA, (pagina - 1) * POR_PAGINA],
  );

  if (linhas.length > 0) {
    const total = linhas[0].total;
    return { dados: linhas.map(({ total: _, ...obra }) => obra), total };
  }

  // Página além do fim não traz linhas (nem o COUNT); conta à parte para devolver o total certo.
  const { total } = await consultarUm(`SELECT COUNT(*) AS total ${FROM_WHERE}`, filtros);
  return { dados: [], total };
}
