// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as exposicoesRepo from '../../repositorios/exposicoes.repo.js';
import * as eventosRepo from '../../repositorios/eventos.repo.js';

export async function buscarDestaques() {
  // TODO (M2): escolher a exposição atual (status) e os próximos eventos de verdade
  const [obras, artistas, exposicoes, eventos] = await Promise.all([
    obrasRepo.listarTodas(),
    artistasRepo.listarTodos(),
    exposicoesRepo.listarTodas(),
    eventosRepo.listarTodos(),
  ]);
  return {
    exposicao_atual: exposicoes[0] ?? null,
    obras: obras.slice(0, 6).map((obra) => ({
      ...obra,
      artista_nome: artistas.find((a) => a.id === obra.artista_id)?.nome ?? null,
    })),
    eventos: eventos.slice(0, 3),
  };
}
