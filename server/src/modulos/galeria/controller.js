// Responsável: M3 — veja a seção "M3" no Guia da Entrega 2
import * as service from './service.js';

export async function listarObras(req, res) {
  res.json(await service.listarObras(req.query));
}
