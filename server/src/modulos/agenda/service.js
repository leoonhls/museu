// Responsável: M5 — veja a seção "M5" no Guia da Entrega 2
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

// "AAAA-MM-DD" vira o início (ou o fim) daquele dia; vazio vira null.
function dataFiltro(valor, fimDoDia = false) {
  if (valor === '' || valor === null || valor === undefined) return null;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw requisicaoInvalida('Data inválida.');
  }
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  // 2026-02-30 "rola" para março: confere se o dia continua o mesmo.
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw requisicaoInvalida('Data inválida.');
  }
  if (fimDoDia) data.setHours(23, 59, 59, 999);
  return data;
}

function lerId(texto) {
  const id = Number(texto);
  if (!Number.isInteger(id) || id < 1) throw requisicaoInvalida('Id inválido.');
  return id;
}

export async function listarExposicoes(filtros) {
  const status = filtros?.status;
  if (status && !['atual', 'futura', 'passada'].includes(status)) {
    throw requisicaoInvalida('Status inválido.');
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const exposicoes = await exposicoesRepo.listarTodas();
  return exposicoes
    .map((exposicao) => ({ ...exposicao, status: statusExposicao(exposicao, hoje) }))
    .filter((exposicao) => !status || exposicao.status === status)
    .sort((a, b) => {
      // Atuais e futuras por data_inicio crescente; as passadas no fim, da mais recente
      // para a mais antiga. Datas AAAA-MM-DD podem ser comparadas como texto.
      const aPassou = a.status === 'passada';
      const bPassou = b.status === 'passada';
      if (aPassou !== bPassou) return aPassou ? 1 : -1;
      return aPassou
        ? b.data_inicio.localeCompare(a.data_inicio)
        : a.data_inicio.localeCompare(b.data_inicio);
    });
}

export async function buscarExposicao(idTexto) {
  const exposicao = await exposicoesRepo.buscarPorId(lerId(idTexto));
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
    throw requisicaoInvalida('Período inválido.');
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
