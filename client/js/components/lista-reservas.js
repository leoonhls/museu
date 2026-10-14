// Responsável: M6 — veja a seção "M6 — Ingressos" no Guia da Entrega 1
import { formatarData } from '../utils/datas.js';

// reservas: resultado de minhasReservas()
export function criarListaReservas(reservas) {
  if (reservas.length === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Nenhuma reserva ainda.';
    return vazio;
  }

  const lista = document.createElement('ul');
  for (const reserva of reservas) {
    const item = document.createElement('li');
    item.textContent = `${reserva.codigo} — ${formatarData(reserva.data_visita)} — ${reserva.status}`;
    lista.append(item);
  }
  return lista;
}
