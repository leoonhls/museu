// Responsável: M5 — veja a seção "M5" no Guia da Entrega 2
import * as exposicoesRepo from '../../repositorios/exposicoes.repo.js';
import * as exposicaoObrasRepo from '../../repositorios/exposicao-obras.repo.js';
import * as eventosRepo from '../../repositorios/eventos.repo.js';
import { naoEncontrado, requisicaoInvalida } from '../../erros.js';

// "AAAA-MM-DD" vira o início (ou o fim) daquele dia; vazio vira null.
function dataFiltro(valor) {
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
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
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
  return exposicoesRepo.listarTodas(status ?? null);
}

export async function buscarExposicao(idTexto) {
  const exposicao = await exposicoesRepo.buscarPorId(lerId(idTexto));
  if (!exposicao) throw naoEncontrado('Exposição não encontrada.');
  const [obras, eventos] = await Promise.all([
    exposicaoObrasRepo.listarPorExposicao(exposicao.id),
    eventosRepo.listarPorExposicao(exposicao.id),
  ]);
  return {
    ...exposicao,
    obras,
    eventos,
  };
}

export async function listarEventos(filtros) {
  const de = dataFiltro(filtros?.de);
  const ate = dataFiltro(filtros?.ate);
  if (de && ate && de > ate) {
    throw requisicaoInvalida('Período inválido.');
  }
  return eventosRepo.listarComVagas({ de, ate });
}
