// Responsável: M3 — veja a seção "M3" no Guia da Entrega 2
import { buscarComFiltros } from '../../repositorios/busca-obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as categoriasRepo from '../../repositorios/categorias.repo.js';

const POR_PAGINA = 12;

export async function listarObras(filtros) {
  // TODO (M3): validar os parâmetros e repassar busca, categoria, artista, anoMin, anoMax e ordem
  const pagina = Math.max(1, Math.trunc(Number(filtros.pagina)) || 1);
  const [{ dados, total }, artistas, categorias] = await Promise.all([
    buscarComFiltros({ pagina }),
    artistasRepo.listarTodos(),
    categoriasRepo.listarTodas(),
  ]);
  return {
    dados: dados.map((obra) => ({
      ...obra,
      artista_nome: artistas.find((a) => a.id === obra.artista_id)?.nome ?? null,
      categoria_nome: categorias.find((c) => c.id === obra.categoria_id)?.nome ?? null,
    })),
    total,
    pagina,
    porPagina: POR_PAGINA,
  };
}
