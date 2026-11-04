// Responsável: M8 — veja a seção "M8" no Guia da Entrega 2
import * as service from './service.js';

export async function criarObra(req, res) {
  res.status(201).json(await service.criarObra());
}

export async function editarObra(req, res) {
  res.json(await service.editarObra());
}

export async function excluirObra(req, res) {
  await service.excluirObra();
  res.status(204).end();
}

export async function receberUpload(req, res) {
  res.status(201).json(await service.enviarImagem());
}
