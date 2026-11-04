// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2
import { naoImplementado } from '../../erros.js';

export async function criarReserva() {
  // TODO (M6): validar quantidades, evento (vagas, data) ou visita comum (regras.js); preço calculado
  // no servidor; código MUS-XXXXX; gravar com reservasRepo.criar
  throw naoImplementado('M6');
}

export async function minhasReservas() {
  // TODO (M6): reservas do usuário logado, mais recentes primeiro, com evento_titulo
  throw naoImplementado('M6');
}

export async function cancelarReserva() {
  // TODO (M6): só o dono (404 para os outros), só se a data não passou e se não estiver cancelada
  throw naoImplementado('M6');
}
