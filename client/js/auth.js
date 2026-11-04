// Responsável: M1
import { usuarioAtual } from './api.js';

// Uso: const usuario = await exigirLogin(); if (usuario) { ... }
export async function exigirLogin() {
  const usuario = await usuarioAtual();
  if (!usuario) {
    const voltar = encodeURIComponent(location.pathname + location.search);
    location.href = `/pages/login.html?voltar=${voltar}`;
    return null;
  }
  return usuario;
}

export async function exigirAdmin() {
  const usuario = await exigirLogin();
  if (usuario && usuario.papel !== 'admin') {
    location.href = '/index.html';
    return null;
  }
  return usuario;
}
