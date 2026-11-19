// Responsável: M3 — veja a seção "M3" no Guia da Entrega 3
// Versão mínima do setup: o JOIN já é SQL, mas filtro, ordem e paginação continuam em
// JavaScript, como na Entrega 2.
// TODO (M3): fazer tudo em SQL: WHERE (com unaccent), ORDER BY, LIMIT/OFFSET e COUNT(*) OVER().
import { consultar } from '../db.js';

export const POR_PAGINA = 12;

// "Impressão" -> "impressao": compara textos sem diferenciar maiúsculas nem acentos.
const semAcento = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const compararTitulo = (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR');

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
  // 1. Junta artista_nome e categoria_nome
  let lista = await consultar(
    `SELECT o.*, a.nome AS artista_nome, c.nome AS categoria_nome
       FROM obras o
       LEFT JOIN artistas a ON a.id = o.artista_id
       LEFT JOIN categorias c ON c.id = o.categoria_id`,
  );

  // 2. Filtra (equivale ao WHERE)
  if (busca) {
    const termo = semAcento(busca);
    lista = lista.filter(
      (obra) => semAcento(obra.titulo).includes(termo) || semAcento(obra.artista_nome).includes(termo),
    );
  }
  if (categoria !== undefined) lista = lista.filter((obra) => obra.categoria_id === categoria);
  if (artista !== undefined) lista = lista.filter((obra) => obra.artista_id === artista);
  if (anoMin !== undefined) lista = lista.filter((obra) => obra.ano >= anoMin);
  if (anoMax !== undefined) lista = lista.filter((obra) => obra.ano <= anoMax);

  // 3. Ordena (equivale ao ORDER BY). Empate de ano desempata pelo título,
  // para a ordem ser sempre a mesma entre as páginas.
  if (ordem === 'antigas') {
    lista.sort((a, b) => a.ano - b.ano || compararTitulo(a, b));
  } else if (ordem === 'recentes') {
    lista.sort((a, b) => b.ano - a.ano || compararTitulo(a, b));
  } else {
    lista.sort(compararTitulo);
  }

  // 4. Pagina (equivale ao LIMIT/OFFSET). Página além do fim devolve [] com o total certo.
  const inicio = (pagina - 1) * POR_PAGINA;
  return { dados: lista.slice(inicio, inicio + POR_PAGINA), total: lista.length };
}
