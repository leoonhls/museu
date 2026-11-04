// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import * as service from './service.js';

export async function usuarioAtual(req, res) {
  res.json(await service.usuarioAtual(req.session.usuarioId));
}

export async function cadastrar(req, res) {
  res.status(201).json(await service.cadastrar(req.body));
}

export async function entrar(req, res) {
  res.json(await service.entrar(req.body));
}

export async function sair(req, res) {
  await service.sair();
  res.status(204).end();
}

export async function listarFavoritos(req, res) {
  res.json(await service.listarFavoritos());
}

export async function favoritar(req, res) {
  await service.favoritar();
  res.status(204).end();
}

export async function desfavoritar(req, res) {
  await service.desfavoritar();
  res.status(204).end();
}
