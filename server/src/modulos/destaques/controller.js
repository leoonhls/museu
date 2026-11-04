// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
import * as service from './service.js';

export async function buscarDestaques(req, res) {
  res.json(await service.buscarDestaques());
}
