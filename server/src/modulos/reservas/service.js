// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2
import * as eventosRepo from '../../repositorios/eventos.repo.js';
import * as historicoRepo from '../../repositorios/historico-conta.repo.js';
import * as reservasRepo from '../../repositorios/reservas.repo.js';
import { naoEncontrado, naoImplementado, requisicaoInvalida } from '../../erros.js';

export async function criarReserva() {
  // TODO (M6): validar quantidades, evento (vagas, data) ou visita comum (regras.js); preço calculado
  // no servidor; código MUS-XXXXX; gravar com reservasRepo.criar
  throw naoImplementado('M6');
}

export async function minhasReservas(usuarioId) {
  const [reservas, eventos] = await Promise.all([
    reservasRepo.listarPorUsuario(usuarioId),
    eventosRepo.listarTodos(),
  ]);
  const eventosPorId = new Map(eventos.map((evento) => [evento.id, evento]));
  return reservas.map((reserva) => ({
    ...reserva,
    evento_titulo: eventosPorId.get(reserva.evento_id)?.titulo ?? null,
  }));
}

export async function cancelarReserva(usuarioId, reservaId) {
  const reserva = await reservasRepo.buscarPorId(reservaId);
  if (!reserva || reserva.usuario_id !== Number(usuarioId)) {
    throw naoEncontrado('Reserva não encontrada.');
  }
  if (reserva.status === 'cancelada') {
    throw requisicaoInvalida('Esta reserva já foi cancelada.');
  }

  const evento = reserva.evento_id ? await eventosRepo.buscarPorId(reserva.evento_id) : null;
  const agora = new Date();
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
  const passou = evento
    ? new Date(evento.data_hora) <= agora
    : reserva.data_visita < hoje;
  if (passou) {
    throw requisicaoInvalida('Não é possível cancelar uma reserva cuja data já passou.');
  }

  const atualizada = await reservasRepo.atualizarStatus(reserva.id, 'cancelada');
  if (!atualizada) throw naoEncontrado('Reserva não encontrada.');
  await historicoRepo.registrar(usuarioId, 'reserva', `Reserva ${reserva.codigo} cancelada.`);
  return atualizada;
}
