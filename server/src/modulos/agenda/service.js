
import * as exposicoesRepo from '../../repositorios/exposicoes.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import * as eventosRepo from '../../repositorios/eventos.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as reservasRepo from '../../repositorios/reservas.repo.js';
import { naoEncontrado, requisicaoInvalida } from '../../erros.js';

function dataLocal(data) {
  return new Date(`${data}T00:00:00`);
}

function statusExposicao(exposicao, hoje) {
  if (dataLocal(exposicao.data_inicio) > hoje) return 'futura';
  if (dataLocal(exposicao.data_fim) < hoje) return 'passada';
  return 'atual';
}

function dataFiltro(valor, fimDoDia = false) {
  if (valor === '' || valor === null || valor === undefined) return null;
  if (typeof valor !== 'string') {
    throw requisicaoInvalida('Informe uma data válida para os filtros de eventos.');
  }
  const texto = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split('-').map(Number);
    const dataCalendario = new Date(ano, mes - 1, dia);
    if (
      dataCalendario.getFullYear() !== ano ||
      dataCalendario.getMonth() !== mes - 1 ||
      dataCalendario.getDate() !== dia
    ) {
      throw requisicaoInvalida('Informe uma data válida para os filtros de eventos.');
    }
  }
  const data = new Date(
    texto.length === 10
      ? `${texto}T${fimDoDia ? '23:59:59.999' : '00:00:00'}`
      : texto,
  );
  if (Number.isNaN(data.getTime())) {
    throw requisicaoInvalida('Informe uma data válida para os filtros de eventos.');
  }
  return data;
}

export async function listarExposicoes(filtros) {
  const status = filtros?.status;
  if (status && !['atual', 'futura', 'passada'].includes(status)) {
    throw requisicaoInvalida('O status deve ser atual, futura ou passada.');
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const exposicoes = await exposicoesRepo.listarTodas();
  return exposicoes
    .map((exposicao) => ({ ...exposicao, status: statusExposicao(exposicao, hoje) }))
    .filter((exposicao) => !status || exposicao.status === status)
    .sort((a, b) => dataLocal(a.data_inicio) - dataLocal(b.data_inicio));
}

export async function buscarExposicao(id) {
  const exposicao = await exposicoesRepo.buscarPorId(id);
  if (!exposicao) throw naoEncontrado('Exposição não encontrada.');
  const [vinculos, obras, artistas, eventos] = await Promise.all([
    exposicaoObrasRepo.listarPorExposicao(exposicao.id),
    obrasRepo.listarTodas(),
    artistasRepo.listarTodos(),
    eventosRepo.listarPorExposicao(exposicao.id),
  ]);
  const idsObras = vinculos.map((v) => v.obra_id);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return {
    ...exposicao,
    status: statusExposicao(exposicao, hoje),
    obras: obras
      .filter((obra) => idsObras.includes(obra.id))
      .map((obra) => ({
        ...obra,
        artista_nome: artistas.find((artista) => artista.id === obra.artista_id)?.nome ?? null,
      })),
    eventos: eventos.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora)),
  };
}

export async function listarEventos(filtros) {
  const de = dataFiltro(filtros?.de);
  const ate = dataFiltro(filtros?.ate, true);
  if (de && ate && de > ate) {
    throw requisicaoInvalida('A data inicial não pode ser posterior à data final.');
  }
  const agora = new Date();
  const inicio = de && de > agora ? de : agora;
  const eventos = await eventosRepo.listarTodos();
  return Promise.all(
    eventos
      .filter((evento) => {
        const dataHora = new Date(evento.data_hora);
        return dataHora >= inicio && (!ate || dataHora <= ate);
      })
      .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
      .map(async (evento) => ({
        ...evento,
        vagas_restantes: Math.max(
          0,
          evento.capacidade - (await reservasRepo.somarIngressosPorEvento(evento.id)),
        ),
      })),
  );
}
