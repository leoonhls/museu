// Responsável: M4 — veja a seção "M4" no Guia da Entrega 2
import * as service from './service.js';

export async function buscarObra(req, res) {
  res.json(await service.detalharObra(req.params.id));
}

export async function listarArtistas(req, res) {
  res.json(await service.listarArtistas());
}

export async function buscarArtista(req, res) {
  res.json(await service.buscarArtista(req.params.id));
}

export async function listarCategorias(req, res) {
  res.json(await service.listarCategorias());
}
