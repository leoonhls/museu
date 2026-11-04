// Responsável: M5 — veja a seção "M5" no Guia da Entrega 2
import * as exposicoesRepo from '../../repositorios/exposicoes.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import * as eventosRepo from '../../repositorios/eventos.repo.js';
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as reservasRepo from '../../repositorios/reservas.repo.js';
import { naoEncontrado } from '../../erros.js';

export async function listarExposicoes(filtros) {
  // TODO (M5): calcular status (atual, futura, passada), filtrar por ?status= e ordenar por data_inicio
  return exposicoesRepo.listarTodas();
}

export async function buscarExposicao(id) {
  // TODO (M5): calcular status
  const exposicao = await exposicoesRepo.buscarPorId(id);
  if (!exposicao) throw naoEncontrado('Exposição não encontrada.');
  const [vinculos, obras, eventos] = await Promise.all([
    exposicaoObrasRepo.listarPorExposicao(exposicao.id),
    obrasRepo.listarTodas(),
    eventosRepo.listarPorExposicao(exposicao.id),
  ]);
  const idsObras = vinculos.map((v) => v.obra_id);
  return { ...exposicao, obras: obras.filter((obra) => idsObras.includes(obra.id)), eventos };
}

export async function listarEventos(filtros) {
  // TODO (M5): filtrar por ?de= e ?ate=, só eventos futuros, ordenar por data_hora
  const eventos = await eventosRepo.listarTodos();
  return Promise.all(
    eventos.map(async (evento) => ({
      ...evento,
      vagas_restantes: evento.capacidade - (await reservasRepo.somarIngressosPorEvento(evento.id)),
    })),
  );
}
