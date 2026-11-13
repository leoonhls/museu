// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2

import crypto from 'node:crypto';

import * as reservasRepo from '../../repositorios/reservas.repo.js';
import * as eventosRepo from '../../repositorios/eventos.repo.js';

import { requisicaoInvalida, naoEncontrado } from '../../erros.js';

import { PRECO_INTEIRA, MAX_INGRESSOS, DIAS_ANTECEDENCIA_MAX, DIA_FECHADO } from './regras.js';

const CARACTERES_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Gera um código de reserva no formato MUS-XXXXX.
async function gerarCodigoReserva() {
  let codigo;

  do {
    codigo = 'MUS-';

    for (let i = 0; i < 5; i++) {
      codigo += CARACTERES_CODIGO[crypto.randomInt(CARACTERES_CODIGO.length)];
    }
  } while (await reservasRepo.buscarPorCodigo(codigo));

  return codigo;
}

function validarQuantidades(qtd_inteira, qtd_meia) {
  if (
    !Number.isInteger(qtd_inteira) ||
    !Number.isInteger(qtd_meia) ||
    qtd_inteira < 0 ||
    qtd_meia < 0
  ) {
    throw requisicaoInvalida(
      'As quantidades de ingressos devem ser números inteiros e não negativos.',
    );
  }

  const total = qtd_inteira + qtd_meia;

  if (total < 1) {
    throw requisicaoInvalida('A reserva deve conter pelo menos um ingresso.');
  }

  if (total > MAX_INGRESSOS) {
    throw requisicaoInvalida(`Cada reserva permite no máximo ${MAX_INGRESSOS} ingressos.`);
  }
}

function validarDataVisita(dataVisita) {
  if (typeof dataVisita !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dataVisita)) {
    throw requisicaoInvalida('Informe uma data válida no formato AAAA-MM-DD.');
  }

  const [ano, mes, dia] = dataVisita.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);

  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw requisicaoInvalida('A data informada não existe.');
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + DIAS_ANTECEDENCIA_MAX);

  if (data < amanha || data > limite) {
    throw requisicaoInvalida(
      `A visita deve ser agendada entre amanhã e ${DIAS_ANTECEDENCIA_MAX} dias.`,
    );
  }

  if (data.getDay() === DIA_FECHADO) {
    throw requisicaoInvalida('O museu não abre às segundas-feiras.');
  }
}

export async function criarReserva(usuarioId, dados) {
  const { evento_id, data_visita, qtd_inteira, qtd_meia } = dados;

  validarQuantidades(qtd_inteira, qtd_meia);

  let evento = null;
  let dataFinal = data_visita;
  let valorBase = PRECO_INTEIRA;

  if (evento_id !== undefined && evento_id !== null && evento_id !== '') {
    evento = await eventosRepo.buscarPorId(evento_id);

    if (!evento) {
      throw naoEncontrado('Evento não encontrado.');
    }

    if (new Date(evento.data_hora) <= new Date()) {
      throw requisicaoInvalida('Este evento já aconteceu.');
    }

    dataFinal = evento.data_hora.slice(0, 10);
    valorBase = evento.preco;
  } else {
    validarDataVisita(data_visita);
  }

  const valor_total =
    Math.round((qtd_inteira * valorBase + (qtd_meia * valorBase) / 2) * 100) / 100;

  const dadosReserva = {
    usuario_id: Number(usuarioId),
    evento_id: evento ? evento.id : null,
    data_visita: dataFinal,
    qtd_inteira,
    qtd_meia,
    valor_total,
    codigo: await gerarCodigoReserva(),
  };

  if (evento) {
    return reservasRepo.criarComLimite(dadosReserva, evento.capacidade);
  }

  return reservasRepo.criar(dadosReserva);
}

export async function minhasReservas(usuarioId) {
  const reservas = await reservasRepo.listarPorUsuario(usuarioId);

  const reservasComEvento = await Promise.all(
    reservas.map(async (reserva) => {
      if (!reserva.evento_id) {
        return {
          ...reserva,
          evento_titulo: null,
        };
      }

      const evento = await eventosRepo.buscarPorId(reserva.evento_id);

      return {
        ...reserva,
        evento_titulo: evento?.titulo ?? null,
      };
    }),
  );

  return reservasComEvento;
}

export async function cancelarReserva(usuarioId, reservaId) {
  const reserva = await reservasRepo.buscarPorId(reservaId);

  if (!reserva || reserva.usuario_id !== Number(usuarioId)) {
    throw naoEncontrado('Reserva não encontrada.');
  }

  if (reserva.status === 'cancelada') {
    throw requisicaoInvalida('Esta reserva já foi cancelada.');
  }

  let dataHoraVisita;

  if (reserva.evento_id) {
    const evento = await eventosRepo.buscarPorId(reserva.evento_id);
    dataHoraVisita = evento?.data_hora;
  } else {
    dataHoraVisita = `${reserva.data_visita}T23:59:59`;
  }

  if (!dataHoraVisita || new Date(dataHoraVisita) <= new Date()) {
    throw requisicaoInvalida('Esta reserva já aconteceu.');
  }

  return reservasRepo.atualizarStatus(reservaId, 'cancelada');
}
