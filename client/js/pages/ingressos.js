// Responsável: M6 — veja a seção "M6 — Ingressos" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirLogin } from '../auth.js';
import { listarEventos, criarReserva } from '../api.js';
import { PRECO_INTEIRA, MAX_INGRESSOS, DIAS_ANTECEDENCIA_MAX, DIA_FECHADO } from '../config.js';
import { mostrarToast } from '../components/toast.js';

montarHeader();
montarFooter();

const usuario = exigirLogin();

if (usuario) {
  const formulario = document.querySelector('#form-reserva');
  const tipoVisita = document.querySelector('#tipo-visita');
  const campoEvento = document.querySelector('#campo-evento');
  const seletorEvento = document.querySelector('#evento');
  const campoData = document.querySelector('#data-visita');
  const qtdInteira = document.querySelector('#qtd-inteira');
  const qtdMeia = document.querySelector('#qtd-meia');
  const resumoQuantidade = document.querySelector('#resumo-quantidade');
  const precoTotal = document.querySelector('#preco-total');
  const avisoData = document.querySelector('#aviso-data');
  const mensagem = document.querySelector('#mensagem-reserva');
  const indicadorEtapa = document.querySelector('#indicador-etapa');
  const etapa1 = formulario;
  const etapa2 = document.querySelector('#etapa-2');
  const etapa3 = document.querySelector('#etapa-3');
  const resumoReserva = document.querySelector('#resumo-reserva');
  const codigoReserva = document.querySelector('#codigo-reserva');
  const linkComprovante = document.querySelector('#link-comprovante');

  let reservaCriada = null;
  let eventosDisponiveis = [];

  function dataLocalISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function somarDias(data, quantidade) {
    const resultado = new Date(data);
    resultado.setDate(resultado.getDate() + quantidade);
    return resultado;
  }

  function configurarDatas() {
    const hoje = new Date();
    const amanha = somarDias(hoje, 1);
    const limite = somarDias(hoje, DIAS_ANTECEDENCIA_MAX);

    campoData.min = dataLocalISO(amanha);
    campoData.max = dataLocalISO(limite);

    // Segunda-feira é o dia 1.
    avisoData.textContent =
      'Escolha uma data de amanhã até os próximos ' +
      `${DIAS_ANTECEDENCIA_MAX} dias. O museu fecha às segundas-feiras.`;
  }

  function obterEventoSelecionado() {
    const id = seletorEvento.value;

    if (!id) return null;

    return eventosDisponiveis.find((evento) => evento.id === Number(id)) || null;
  }

  function atualizarEventos() {
    seletorEvento.replaceChildren();

    const opcaoInicial = document.createElement('option');
    opcaoInicial.value = '';
    opcaoInicial.textContent = 'Selecione um evento';
    seletorEvento.append(opcaoInicial);

    eventosDisponiveis.forEach((evento) => {
      const opcao = document.createElement('option');
      opcao.value = evento.id;
      opcao.textContent = `${evento.titulo} — ${new Date(evento.data_hora).toLocaleString('pt-BR')}`;
      seletorEvento.append(opcao);
    });

    const idDaUrl = new URLSearchParams(location.search).get('evento');

    if (idDaUrl) {
      tipoVisita.value = 'evento';
      campoEvento.hidden = false;
      seletorEvento.value = idDaUrl;
      seletorEvento.required = true;

      if (!seletorEvento.value) {
        mensagem.textContent = 'O evento solicitado não está disponível.';
      }
    }
  }

  function atualizarTipoVisita() {
    const eEvento = tipoVisita.value === 'evento';

    campoEvento.hidden = !eEvento;
    seletorEvento.required = eEvento;
    campoData.required = !eEvento;

    if (eEvento) {
      campoData.value = '';
    }

    atualizarPreco();
  }

  function atualizarPreco() {
    const inteira = Number(qtdInteira.value);
    const meia = Number(qtdMeia.value);
    const evento = tipoVisita.value === 'evento' ? obterEventoSelecionado() : null;
    const total = inteira + meia;

    resumoQuantidade.textContent = `Total de ingressos: ${total}`;

    if (tipoVisita.value === 'evento' && !evento) {
      precoTotal.textContent = 'Valor estimado: selecione um evento';
    } else {
      const base = evento ? Number(evento.preco) : PRECO_INTEIRA;
      const valor = inteira * base + (meia * base) / 2;

      precoTotal.textContent = `Valor estimado: ${valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}`;
    }

    if (total > MAX_INGRESSOS) {
      mensagem.textContent = `O máximo é de ${MAX_INGRESSOS} ingressos por reserva.`;
    } else if (tipoVisita.value === 'evento' && !evento) {
      mensagem.textContent = 'Selecione um evento disponível.';
    } else {
      mensagem.textContent = '';
    }
  }

  function validarFormulario() {
    const inteira = Number(qtdInteira.value);
    const meia = Number(qtdMeia.value);
    const total = inteira + meia;

    if (
      qtdInteira.value.trim() === '' ||
      qtdMeia.value.trim() === '' ||
      !Number.isInteger(inteira) ||
      !Number.isInteger(meia) ||
      inteira < 0 ||
      meia < 0
    ) {
      throw new Error('Informe quantidades inteiras e não negativas.');
    }

    if (total < 1) {
      throw new Error('Escolha pelo menos 1 ingresso.');
    }

    if (total > MAX_INGRESSOS) {
      throw new Error(`O máximo é de ${MAX_INGRESSOS} ingressos por reserva.`);
    }

    if (tipoVisita.value === 'evento') {
      const evento = obterEventoSelecionado();

      if (!evento) {
        throw new Error('Selecione um evento disponível.');
      }
    } else {
      if (!campoData.value) {
        throw new Error('Escolha a data da visita.');
      }

      const dataEscolhida = new Date(`${campoData.value}T12:00:00`);
      const hoje = new Date();
      const amanha = somarDias(hoje, 1);
      const limite = somarDias(hoje, DIAS_ANTECEDENCIA_MAX);

      const dataISO = campoData.value;
      const amanhaISO = dataLocalISO(amanha);
      const limiteISO = dataLocalISO(limite);

      if (Number.isNaN(dataEscolhida.getTime())) {
        throw new Error('Informe uma data válida.');
      }

      if (dataISO < amanhaISO || dataISO > limiteISO) {
        throw new Error(
          `Escolha uma data entre amanhã e os próximos ${DIAS_ANTECEDENCIA_MAX} dias.`,
        );
      }

      if (dataEscolhida.getDay() === DIA_FECHADO) {
        throw new Error('O museu fecha às segundas-feiras.');
      }
    }
  }

  function mostrarResumo() {
    const evento = tipoVisita.value === 'evento' ? obterEventoSelecionado() : null;

    const data = evento
      ? new Date(evento.data_hora).toLocaleString('pt-BR')
      : new Date(`${campoData.value}T12:00:00`).toLocaleDateString('pt-BR');

    const base = evento ? Number(evento.preco) : PRECO_INTEIRA;
    const inteira = Number(qtdInteira.value);
    const meia = Number(qtdMeia.value);
    const valor = inteira * base + (meia * base) / 2;

    resumoReserva.replaceChildren();

    const dados = [
      ['Tipo', evento ? 'Evento' : 'Visita ao museu'],
      ['Evento', evento ? evento.titulo : 'Visita comum'],
      ['Data', data],
      ['Ingressos inteiros', inteira],
      ['Meia-entrada', meia],
      [
        'Valor estimado',
        valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      ],
    ];

    dados.forEach(([rotulo, valorCampo]) => {
      const paragrafo = document.createElement('p');
      paragrafo.textContent = `${rotulo}: ${valorCampo}`;
      resumoReserva.append(paragrafo);
    });
  }

  function irParaEtapa2() {
    try {
      validarFormulario();
      mostrarResumo();
      etapa1.hidden = true;
      etapa2.hidden = false;
      indicadorEtapa.textContent = 'Etapa 2 de 3 — Confira os dados';
      mensagem.textContent = '';
    } catch (erro) {
      mensagem.textContent = erro.message;
      mostrarToast(erro.message, 'erro');
    }
  }

  function confirmarReserva() {
    try {
      const evento = tipoVisita.value === 'evento' ? obterEventoSelecionado() : null;

      reservaCriada = criarReserva({
        evento_id: evento ? evento.id : null,
        data_visita: evento ? undefined : campoData.value,
        qtd_inteira: Number(qtdInteira.value),
        qtd_meia: Number(qtdMeia.value),
      });

      codigoReserva.textContent = `Código da reserva: ${reservaCriada.codigo}`;
      linkComprovante.href = `reserva.html?codigo=${encodeURIComponent(reservaCriada.codigo)}`;

      etapa2.hidden = true;
      etapa3.hidden = false;
      indicadorEtapa.textContent = 'Etapa 3 de 3 — Reserva confirmada';
      mensagem.textContent = '';

      mostrarToast('Reserva confirmada com sucesso!');
    } catch (erro) {
      mensagem.textContent = erro.message;
      mostrarToast(erro.message, 'erro');
    }
  }

  document.querySelector('#proxima-etapa').addEventListener('click', irParaEtapa2);

  document.querySelector('#voltar-etapa-1').addEventListener('click', () => {
    etapa2.hidden = true;
    etapa1.hidden = false;
    indicadorEtapa.textContent = 'Etapa 1 de 3 — Escolha da visita';
    mensagem.textContent = '';
  });

  document.querySelector('#confirmar-reserva').addEventListener('click', confirmarReserva);

  tipoVisita.addEventListener('change', atualizarTipoVisita);
  seletorEvento.addEventListener('change', atualizarPreco);
  qtdInteira.addEventListener('input', atualizarPreco);
  qtdMeia.addEventListener('input', atualizarPreco);

  qtdInteira.max = MAX_INGRESSOS;
  qtdMeia.max = MAX_INGRESSOS;

  eventosDisponiveis = listarEventos();
  atualizarEventos();
  configurarDatas();
  atualizarTipoVisita();
  atualizarPreco();
}
