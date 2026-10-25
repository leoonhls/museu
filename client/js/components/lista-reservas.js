// Responsável: M6 — veja a seção "M6 — Ingressos" no Guia da Entrega 1
import { cancelarReserva } from '../api.js';
import { formatarData } from '../utils/datas.js';
import { urlApp } from '../utils/rotas.js';
import { confirmar } from './modal.js';
import { mostrarToast } from './toast.js';

const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function hojeTexto() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// reservas: resultado de minhasReservas()
// aoCancelar: chamada depois de cancelar uma reserva, para a página redesenhar a lista
export function criarListaReservas(reservas, aoCancelar = () => {}) {
  if (reservas.length === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Nenhuma reserva ainda.';
    return vazio;
  }

  const lista = document.createElement('ul');
  lista.className = 'lista-reservas';

  for (const reserva of reservas) {
    const item = document.createElement('li');
    item.className = `card lista-reservas__item lista-reservas__item--${reserva.status}`;

    const codigo = document.createElement('a');
    codigo.className = 'lista-reservas__codigo';
    codigo.href = urlApp(`pages/reserva.html?codigo=${encodeURIComponent(reserva.codigo)}`);
    codigo.textContent = reserva.codigo;

    const titulo = document.createElement('p');
    titulo.textContent = `${reserva.evento_titulo ?? 'Visita ao museu'} — ${formatarData(reserva.data_visita)}`;

    const detalhes = document.createElement('p');
    const total = reserva.qtd_inteira + reserva.qtd_meia;
    detalhes.textContent = `${total} ${total === 1 ? 'ingresso' : 'ingressos'} · ${formatoPreco.format(reserva.valor_total)}`;

    const status = document.createElement('span');
    status.className = 'tag';
    status.textContent = reserva.status === 'confirmada' ? 'Confirmada' : 'Cancelada';

    item.append(codigo, titulo, detalhes, status);

    if (reserva.status === 'confirmada' && reserva.data_visita >= hojeTexto()) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'botao botao--secundario';
      botao.textContent = 'Cancelar reserva';
      botao.addEventListener('click', () => {
        confirmar(`Cancelar a reserva ${reserva.codigo}?`, () => {
          try {
            cancelarReserva(reserva.id);
            mostrarToast('Reserva cancelada.');
            aoCancelar();
          } catch (erro) {
            mostrarToast(erro.message, 'erro');
          }
        });
      });
      item.append(botao);
    }

    lista.append(item);
  }
  return lista;
}
