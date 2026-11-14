// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import * as service from './service.js';

export async function usuarioAtual(req, res) {
  res.json(await service.usuarioAtual(req.session.usuarioId));
}

export async function obterPerfil(req, res) {
  res.json(await service.obterPerfil(req.usuario.id));
}

export async function atualizarPerfil(req, res) {
  res.json(await service.atualizarPerfil(req.usuario.id, req.body));
}

export async function listarHistorico(req, res) {
  res.json(await service.listarHistorico(req.usuario.id));
}

export async function cadastrar(req, res) {
  const usuario = await service.cadastrar(req.body);
  req.session.usuarioId = usuario.id;
  res.status(201).json(usuario);
}

export async function entrar(req, res) {
  const usuario = await service.entrar(req.body);
  await new Promise((resolve, reject) => {
    req.session.regenerate((erro) => (erro ? reject(erro) : resolve()));
  });
  req.session.usuarioId = usuario.id;
  res.json(usuario);
}

export async function sair(req, res) {
  await service.sair(req.session);
  res.clearCookie('connect.sid');
  res.status(204).end();
}

export async function listarFavoritos(req, res) {
  res.json(await service.listarFavoritos(req.usuario.id));
}

export async function favoritar(req, res) {
  await service.favoritar(req.usuario.id, req.params.obraId);
  res.status(204).end();
}

export async function desfavoritar(req, res) {
  await service.desfavoritar(req.usuario.id, req.params.obraId);
  res.status(204).end();
}
