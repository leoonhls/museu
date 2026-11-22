// Responsável: M2 — Seed, dados de demonstração e destaques (Entrega 3)
import * as destaquesRepo from '../../repositorios/destaques.repo.js';

export async function listarDestaques() {
  const [exposicao_atual, obras, eventos] = await Promise.all([
    destaquesRepo.buscarExposicaoAtual(),
    destaquesRepo.buscarObrasDestaque(),
    destaquesRepo.buscarProximosEventos(),
  ]);

  return {
    exposicao_atual,
    obras,
    eventos,
  };
}
