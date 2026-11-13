// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2
import { atualizarTabela, lerTabela, proximoId } from './base-json.js';
import { requisicaoInvalida } from '../erros.js';

// Mais recentes primeiro.
export async function listarPorUsuario(usuarioId) {
  return (await lerTabela('reservas'))
    .filter((reserva) => reserva.usuario_id === Number(usuarioId))
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id);
}

export async function buscarPorId(id) {
  return (await lerTabela('reservas')).find((reserva) => reserva.id === Number(id)) ?? null;
}

export async function buscarPorCodigo(codigo) {
  return (await lerTabela('reservas')).find((reserva) => reserva.codigo === codigo) ?? null;
}
// Soma inteiras + meias das reservas confirmadas do evento.
export async function somarIngressosPorEvento(eventoId) {
  return (await lerTabela('reservas'))
    .filter((r) => r.evento_id === Number(eventoId) && r.status === 'confirmada')
    .reduce((soma, r) => soma + r.qtd_inteira + r.qtd_meia, 0);
}

export async function criar(dados) {
  return atualizarTabela('reservas', (linhas) => {
    // status padrão 'confirmada': só as confirmadas contam na lotação do evento.
    const reserva = {
      status: 'confirmada',
      ...dados,
      id: proximoId(linhas),
      criado_em: new Date().toISOString(),
    };
    return { linhas: [...linhas, reserva], resultado: reserva };
  });
}

// Cria uma reserva de evento somente se ainda houver vagas.
export async function criarComLimite(dados, capacidade) {
  return atualizarTabela('reservas', (linhas) => {
    const ocupadas = linhas
      .filter((r) => r.evento_id === dados.evento_id && r.status === 'confirmada')
      .reduce((soma, r) => soma + r.qtd_inteira + r.qtd_meia, 0);

    const pedidas = dados.qtd_inteira + dados.qtd_meia;

    if (ocupadas + pedidas > capacidade) {
      const restam = capacidade - ocupadas;

      throw requisicaoInvalida(
        restam > 0 ? `Restam apenas ${restam} vagas para este evento.` : 'Evento esgotado.',
      );
    }

    const reserva = {
      status: 'confirmada',
      ...dados,
      id: proximoId(linhas),
      criado_em: new Date().toISOString(),
    };

    return {
      linhas: [...linhas, reserva],
      resultado: reserva,
    };
  });
}

// Devolve a reserva atualizada, ou null se não existir.
export async function atualizarStatus(id, status) {
  return atualizarTabela('reservas', (linhas) => {
    const indice = linhas.findIndex((reserva) => reserva.id === Number(id));
    if (indice === -1) return { linhas, resultado: null };
    const novas = [...linhas];
    novas[indice] = { ...linhas[indice], status };
    return { linhas: novas, resultado: novas[indice] };
  });
}
