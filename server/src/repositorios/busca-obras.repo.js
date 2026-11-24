// Responsável: M3 — veja a seção "M3" no Guia da Entrega 3
// A busca da galeria numa consulta SQL só: WHERE montado com parâmetros, ORDER BY de uma
// lista fixa, LIMIT/OFFSET para a página e COUNT(*) OVER() para o total.
import { consultar, consultarUm } from '../db.js';

export const POR_PAGINA = 12;

// Limites do tipo integer do PostgreSQL. O service aceita qualquer inteiro do JavaScript;
// um valor fora desse intervalo faria o banco recusar o parâmetro (erro 22003).
const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

// Direção e coluna de ordem NÃO podem ser parâmetro ($1): vêm só desta lista fixa.
// COLLATE "pt-BR-x-icu" ordena como o localeCompare('pt-BR') da Entrega 2 (os dois usam a
// biblioteca ICU), em qualquer computador; sem ele, a ordem dependeria do sistema operacional.
// O o.id no fim desempata, para a ordem ser sempre a mesma entre as páginas.
const TITULO = 'o.titulo COLLATE "pt-BR-x-icu"';
const ORDENS = {
  titulo: `${TITULO} ASC, o.id`,
  antigas: `o.ano ASC, ${TITULO} ASC, o.id`,
  recentes: `o.ano DESC, ${TITULO} ASC, o.id`,
};

// No ILIKE, % e _ são curingas e \ é o caractere de escape. Escapando os três, "50%" busca
// o texto "50%" de verdade, como o includes() fazia na Entrega 2.
const escaparLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');

// Monta o WHERE. Os pedaços de texto são fixos (escritos aqui); os valores vão sempre
// como parâmetro. Nenhum valor do usuário é concatenado no SQL.
function montarWhere({ busca, categoria, artista, anoMin, anoMax }) {
  const condicoes = [];
  const valores = [];

  // Troca cada "?" do trecho pelo número do parâmetro ($1, $2...) e guarda o valor.
  // Os dois "?" da busca viram o MESMO parâmetro: o texto é procurado no título e no artista.
  function adicionar(trecho, valor) {
    valores.push(valor);
    condicoes.push(trecho.replaceAll('?', `$${valores.length}`));
  }

  if (busca) {
    adicionar(
      `(unaccent(o.titulo) ILIKE unaccent('%' || ? || '%')
        OR unaccent(a.nome) ILIKE unaccent('%' || ? || '%'))`,
      escaparLike(busca),
    );
  }

  // Ids acima do maior integer não existem: a condição é falsa, sem perguntar ao banco.
  if (categoria !== undefined) {
    if (categoria > INT_MAX) condicoes.push('FALSE');
    else adicionar('o.categoria_id = ?', categoria);
  }
  if (artista !== undefined) {
    if (artista > INT_MAX) condicoes.push('FALSE');
    else adicionar('o.artista_id = ?', artista);
  }

  // Anos fora do intervalo do integer: "ano >= -99999999999" é sempre verdade e
  // "ano >= 99999999999" nunca é. Encostar o valor no limite dá exatamente o mesmo resultado.
  const limitar = (ano) => Math.min(INT_MAX, Math.max(INT_MIN, ano));
  if (anoMin !== undefined) adicionar('o.ano >= ?', limitar(anoMin));
  if (anoMax !== undefined) adicionar('o.ano <= ?', limitar(anoMax));

  // Sem filtros, nada de "WHERE" sobrando; com filtros, nada de "AND" solto.
  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  return { where, valores };
}

const DE_OBRAS = `
  FROM obras o
  JOIN artistas a ON a.id = o.artista_id
  JOIN categorias c ON c.id = o.categoria_id`;

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
  const { where, valores } = montarWhere({ busca, categoria, artista, anoMin, anoMax });
  const orderBy = ORDENS[ordem] ?? ORDENS.titulo;

  // COUNT(*) OVER() conta as linhas que passaram no WHERE ANTES do LIMIT e repete o número
  // em cada linha: é o total da paginação sem uma segunda consulta.
  const parametros = [...valores, POR_PAGINA, (pagina - 1) * POR_PAGINA];
  const linhas = await consultar(
    `SELECT o.*, a.nome AS artista_nome, c.nome AS categoria_nome,
            COUNT(*) OVER() AS total
       ${DE_OBRAS}
       ${where}
      ORDER BY ${orderBy}
      LIMIT $${parametros.length - 1} OFFSET $${parametros.length}`,
    parametros,
  );

  // Tira a coluna "total" de cada obra: ela não faz parte da obra.
  const dados = linhas.map(({ total, ...obra }) => obra);
  if (linhas.length > 0) return { dados, total: linhas[0].total };

  // Página além do fim: o LIMIT não trouxe linha nenhuma e o total se perdeu junto.
  // Na página 1, lista vazia quer dizer total 0; nas outras, conta de novo com o mesmo WHERE.
  if (pagina === 1) return { dados, total: 0 };
  const { total } = await consultarUm(`SELECT COUNT(*) AS total ${DE_OBRAS} ${where}`, valores);
  return { dados, total };
}
