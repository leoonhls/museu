// Responsável: M1
import { usuarioAtual } from './api.js';
import { caminhoInicio, urlApp } from './utils/rotas.js';

// Uso no início de uma página protegida:
//   const usuario = exigirLogin();
//   if (usuario) { ...código da página... }
export function exigirLogin() {
  const usuario = usuarioAtual();
  if (!usuario) {
    const voltar = encodeURIComponent(location.pathname + location.search);
    location.href = `${urlApp('pages/login.html')}?voltar=${voltar}`;
    return null;
  }
  return usuario;
}

export function exigirAdmin() {
  const usuario = exigirLogin();
  if (usuario && usuario.papel !== 'admin') {
    location.href = caminhoInicio();
    return null;
  }
  return usuario;
}
