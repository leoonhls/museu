// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
import * as service from './service.js';

export async function listarDestaques(req, res) {
  const dados = await service.listarDestaques();
  res.json(dados);
}
