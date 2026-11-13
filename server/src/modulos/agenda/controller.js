
import * as service from './service.js';

export async function listarExposicoes(req, res) {
  res.json(await service.listarExposicoes(req.query));
}

export async function buscarExposicao(req, res) {
  res.json(await service.buscarExposicao(req.params.id));
}

export async function listarEventos(req, res) {
  res.json(await service.listarEventos(req.query));
}
