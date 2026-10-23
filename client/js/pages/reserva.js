// Responsável: M6 — veja a seção "M6 — Ingressos" no Guia da Entrega 1

import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirLogin } from '../auth.js';
import { minhasReservas } from '../api.js';

montarHeader();
montarFooter();

const usuario = exigirLogin();

if (usuario) {
  const mensagem = document.querySelector('#mensagem-comprovante');
  const dados = document.querySelector('#dados-comprovante');

  const codigo = document.querySelector('#codigo');
  const tipoVisita = document.querySelector('#tipo-visita');
  const dataVisita = document.querySelector('#data-visita');
  const qtdInteira = document.querySelector('#qtd-inteira');
  const qtdMeia = document.querySelector('#qtd-meia');
  const valorTotal = document.querySelector('#valor-total');
  const statusReserva = document.querySelector('#status-reserva');
  const botaoImprimir = document.querySelector('#imprimir-comprovante');

  const parametros = new URLSearchParams(location.search);
  const codigoProcurado = parametros.get('codigo');

  let reserva = null;
  mensagem.textContent = '';
  try {
    reserva = codigoProcurado
      ? minhasReservas().find((item) => item.codigo === codigoProcurado)
      : null;
  } catch (erro) {
    mensagem.textContent = erro.message;
  }

  if (!reserva) {
    mensagem.textContent ||= 'Não encontramos essa reserva. Confira o link ou faça uma nova reserva.';
  } else {
    mensagem.textContent = 'Sua reserva foi encontrada!';
    dados.hidden = false;

    codigo.textContent = reserva.codigo;

    tipoVisita.textContent = reserva.evento_titulo || 'Visita ao museu';

    dataVisita.textContent = new Date(`${reserva.data_visita}T00:00:00`).toLocaleDateString(
      'pt-BR',
    );

    qtdInteira.textContent = reserva.qtd_inteira;
    qtdMeia.textContent = reserva.qtd_meia;

    valorTotal.textContent = Number(reserva.valor_total).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    statusReserva.textContent = reserva.status;

    botaoImprimir.addEventListener('click', () => {
      window.print();
    });
  }
}
