// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2

import * as service from './service.js';

export async function criar(req, res) {
  const reserva = await service.criarReserva(req.usuario.id, req.body);
  res.status(201).json(reserva);
}

export async function listarMinhas(req, res) {
  const reservas = await service.minhasReservas(req.usuario.id);
  res.json(reservas);
}

export async function cancelar(req, res) {
  const reserva = await service.cancelarReserva(req.usuario.id, req.params.id);
  res.json(reserva);
}
