// client/js/auth.js — sessão do usuário no front.
//
// Guarda o usuário logado em memória (uma consulta por página) e protege
// páginas. Não acessa localStorage: tudo passa pelo api.js, então este
// arquivo não muda na Entrega 2.

import * as api from './api.js';

const PAGINA_LOGIN = '/pages/login.html';

let usuarioCache; // undefined = ainda não consultado

// Usuário logado (sem senha) ou null.
export async function usuarioLogado() {
  if (usuarioCache === undefined) usuarioCache = await api.usuarioAtual();
  return usuarioCache;
}

export async function estaLogado() {
  return (await usuarioLogado()) !== null;
}

export async function ehAdmin() {
  return (await usuarioLogado())?.papel === 'admin';
}

// Avisa a página (ex.: header) que a sessão mudou.
function notificar() {
  document.dispatchEvent(new CustomEvent('sessao-alterada', { detail: usuarioCache }));
}

export async function entrar(email, senha) {
  usuarioCache = await api.entrar(email, senha);
  notificar();
  return usuarioCache;
}

export async function cadastrar(dados) {
  usuarioCache = await api.cadastrar(dados);
  notificar();
  return usuarioCache;
}

export async function sair() {
  await api.sair();
  usuarioCache = null;
  notificar();
}

// Link de login que volta para a página atual depois de entrar.
export function urlLogin(voltar = location.pathname + location.search) {
  return `${PAGINA_LOGIN}?voltar=${encodeURIComponent(voltar)}`;
}

// Para usar em login.html após entrar: volta para onde o usuário estava.
// Só aceita caminhos do próprio site.
export function voltarDoLogin(padrao = '/') {
  const destino = new URLSearchParams(location.search).get('voltar');
  location.href = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : padrao;
}

// Chamar no topo do script de páginas que exigem login.
// Devolve o usuário; se não houver, redireciona e nunca resolve.
export async function exigirLogin() {
  const usuario = await usuarioLogado();
  if (!usuario) {
    location.replace(urlLogin());
    return new Promise(() => {});
  }
  return usuario;
}

// Chamar no topo do script das páginas de admin.
export async function exigirAdmin() {
  const usuario = await exigirLogin();
  if (usuario.papel !== 'admin') {
    location.replace('/?erro=acesso-negado');
    return new Promise(() => {});
  }
  return usuario;
}
