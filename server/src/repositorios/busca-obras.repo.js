// Responsável: M3 — veja a seção "M3" no Guia da Entrega 2
// Na Entrega 3 esta função vira uma consulta SQL; por isso a filtragem fica aqui, e não no service.
import { lerTabela } from './base-json.js';

const POR_PAGINA = 12;

export async function buscarComFiltros({ pagina = 1 } = {}) {
  // TODO (M3): aplicar busca, categoria, artista, anoMin, anoMax e ordem
  const obras = await lerTabela('obras');
  const inicio = (pagina - 1) * POR_PAGINA;
  return { dados: obras.slice(inicio, inicio + POR_PAGINA), total: obras.length };
}
