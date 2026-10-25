// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
import { aplicarPreferenciasAcessibilidade, usuarioAtual, sair } from '../api.js';
import { caminhoInicio, urlApp } from '../utils/rotas.js';

function criarLink(caminho, texto) {
  const link = document.createElement('a');
  link.href = urlApp(caminho);
  link.textContent = texto;
  if (new URL(link.href).pathname === location.pathname) link.setAttribute('aria-current', 'page');
  return link;
}

export function montarHeader() {
  const alvo = document.getElementById('header');
  if (!alvo) return;

  aplicarPreferenciasAcessibilidade();
  const usuario = usuarioAtual();

  const header = document.createElement('header');
  header.className = 'header';

  const conteudo = document.createElement('div');
  conteudo.className = 'container header__conteudo';

  const logo = criarLink('index.html', 'Museu de Artes');
  logo.className = 'header__logo';

  const nav = document.createElement('nav');
  nav.className = 'header__nav';
  nav.id = 'menu-principal';
  nav.setAttribute('aria-label', 'Principal');
  nav.append(
    criarLink('pages/obras.html', 'Acervo'),
    criarLink('pages/exposicoes.html', 'Exposições'),
    criarLink('pages/eventos.html', 'Eventos'),
    criarLink('pages/ingressos.html', 'Ingressos'),
  );

  if (usuario) {
    if (usuario.papel === 'admin') nav.append(criarLink('pages/admin/obras.html', 'Admin'));
    nav.append(criarLink('pages/perfil.html', 'Meu perfil'));

    const botaoSair = document.createElement('button');
    botaoSair.type = 'button';
    botaoSair.className = 'header__sair';
    botaoSair.textContent = 'Sair';
    botaoSair.addEventListener('click', () => {
      sair();
      location.href = caminhoInicio();
    });
    nav.append(botaoSair);
  } else {
    const entrar = criarLink('pages/login.html', 'Entrar');
    entrar.className = 'botao';
    nav.append(entrar);
  }

  // Menu sanduíche: só aparece em telas pequenas (components.css)
  const botaoMenu = document.createElement('button');
  botaoMenu.type = 'button';
  botaoMenu.className = 'header__menu';
  botaoMenu.textContent = '☰';
  botaoMenu.setAttribute('aria-label', 'Abrir menu');
  botaoMenu.setAttribute('aria-controls', nav.id);
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.addEventListener('click', () => {
    const aberto = header.classList.toggle('header--aberto');
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  conteudo.append(logo, botaoMenu, nav);
  header.append(conteudo);
  alvo.replaceChildren(header);
}
