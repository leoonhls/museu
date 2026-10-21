// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1

// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
import { usuarioAtual, sair } from '../api.js';

function criarLink(href, texto) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = texto;

  // Marca o link como ativo se corresponder ao pathname atual
  if (window.location.pathname === href) {
    link.classList.add('ativo');
  }

  return link;
}

export function montarHeader() {
  const usuario = usuarioAtual();

  const header = document.createElement('header');
  header.className = 'header container';

  // Botão do menu mobile (hambúrguer)
  const botaoMenu = document.createElement('button');
  botaoMenu.type = 'button';
  botaoMenu.className = 'header__menu-botao';
  botaoMenu.setAttribute('aria-label', 'Abrir menu');
  botaoMenu.textContent = '☰';

  const nav = document.createElement('nav');
  nav.className = 'header__nav';
  nav.append(
    criarLink('/index.html', 'Início'),
    criarLink('/pages/obras.html', 'Acervo'),
    criarLink('/pages/exposicoes.html', 'Exposições'),
    criarLink('/pages/eventos.html', 'Eventos'),
    criarLink('/pages/ingressos.html', 'Ingressos'),
  );

  const conta = document.createElement('div');
  conta.style.display = 'flex';
  conta.style.alignItems = 'center';
  conta.style.gap = 'var(--espaco-2)';

  if (usuario) {
    if (usuario.papel === 'admin') {
      conta.append(criarLink('/pages/admin/obras.html', 'Admin'));
    }
    const botaoSair = document.createElement('button');
    botaoSair.type = 'button';
    botaoSair.className = 'botao botao--secundario';
    botaoSair.style.padding = '0.3rem 0.8rem';
    botaoSair.textContent = 'Sair';
    botaoSair.addEventListener('click', () => {
      sair();
      location.href = '/index.html';
    });
    conta.append(criarLink('/pages/perfil.html', 'Meu perfil'), botaoSair);
  } else {
    conta.append(criarLink('/pages/login.html', 'Entrar'));
  }

  nav.append(conta);

  // Evento para abrir/fechar o menu no celular
  botaoMenu.addEventListener('click', () => {
    nav.classList.toggle('ativo');
  });

  header.append(criarLink('/index.html', 'Museu'), botaoMenu, nav);

  const alvoHeader = document.getElementById('header');
  if (alvoHeader) {
    alvoHeader.replaceChildren(header);
  }
}

// import { usuarioAtual, sair } from '../api.js';

// function criarLink(href, texto) {
//   const link = document.createElement('a');
//   link.href = href;
//   link.textContent = texto;
//   return link;
// }

// export function montarHeader() {
//   const usuario = usuarioAtual();

//   const header = document.createElement('header');
//   header.className = 'header container';

//   const nav = document.createElement('nav');
//   nav.append(
//     criarLink('/pages/obras.html', 'Acervo'),
//     criarLink('/pages/exposicoes.html', 'Exposições'),
//     criarLink('/pages/eventos.html', 'Eventos'),
//     criarLink('/pages/ingressos.html', 'Ingressos'),
//   );

//   const conta = document.createElement('div');
//   if (usuario) {
//     if (usuario.papel === 'admin') conta.append(criarLink('/pages/admin/obras.html', 'Admin'));
//     const botaoSair = document.createElement('button');
//     botaoSair.type = 'button';
//     botaoSair.textContent = 'Sair';
//     botaoSair.addEventListener('click', () => {
//       sair();
//       location.href = '/index.html';
//     });
//     conta.append(criarLink('/pages/perfil.html', 'Meu perfil'), botaoSair);
//   } else {
//     conta.append(criarLink('/pages/login.html', 'Entrar'));
//   }

//   header.append(criarLink('/index.html', 'Museu'), nav, conta);
//   document.getElementById('header').replaceChildren(header);
// }
