// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2
import * as service from './service.js';

export async function criar(req, res) {
  res.status(201).json(await service.criarReserva());
}

export async function listarMinhas(req, res) {
  res.json(await service.minhasReservas());
}

export async function cancelar(req, res) {
  res.json(await service.cancelarReserva());
}
