// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import * as usuariosRepo from '../repositorios/usuarios.repo.js';
import { naoAutenticado, proibido } from '../erros.js';

// Carrega o usuário da sessão em req.usuario (sem senha_hash).
export async function exigirLogin(req, res, next) {
  if (!req.session.usuarioId) throw naoAutenticado();
  const usuario = await usuariosRepo.buscarPorId(req.session.usuarioId);
  if (!usuario) {
    await new Promise((resolve) => req.session.destroy(resolve));
    throw naoAutenticado();
  }
  const { senha_hash, ...semSenha } = usuario;
  req.usuario = semSenha;
  next();
}

export async function exigirAdmin(req, res, next) {
  await exigirLogin(req, res, () => {});
  if (req.usuario.papel !== 'admin') throw proibido();
  next();
}
