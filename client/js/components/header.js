// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
import { usuarioAtual, sair } from '../api.js';

function criarLink(href, texto) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = texto;
  return link;
}

export function montarHeader() {
  const usuario = usuarioAtual();

  const header = document.createElement('header');
  header.className = 'header container';

  const nav = document.createElement('nav');
  nav.append(
    criarLink('/pages/obras.html', 'Acervo'),
    criarLink('/pages/exposicoes.html', 'Exposições'),
    criarLink('/pages/eventos.html', 'Eventos'),
    criarLink('/pages/ingressos.html', 'Ingressos'),
  );

  const conta = document.createElement('div');
  if (usuario) {
    if (usuario.papel === 'admin') conta.append(criarLink('/pages/admin/obras.html', 'Admin'));
    const botaoSair = document.createElement('button');
    botaoSair.type = 'button';
    botaoSair.textContent = 'Sair';
    botaoSair.addEventListener('click', () => {
      sair();
      location.href = '/index.html';
    });
    conta.append(criarLink('/pages/perfil.html', 'Meu perfil'), botaoSair);
  } else {
    conta.append(criarLink('/pages/login.html', 'Entrar'));
  }

  header.append(criarLink('/index.html', 'Museu'), nav, conta);
  document.getElementById('header').replaceChildren(header);
}
