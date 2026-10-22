// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
import { usuarioAtual } from '../api.js';

export function montarHeader() {
  const usuario = usuarioAtual();
  const alvo = document.querySelector('#header');
  if (!alvo) return;

  alvo.innerHTML = `
    <header class="header-museu" style="background-color: var(--cor-superficie); border-bottom: 1px solid var(--cor-borda); padding: 1rem 0; position: sticky; top: 0; z-index: 100;">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center; position: relative;">
        <a href="/index.html" style="font-family: var(--fonte-titulo); font-size: 1.5rem; color: var(--cor-texto); text-decoration: none; font-weight: 600;">Museu de Artes</a>

        <!-- Botão do menu sanduíche para telas menores -->
        <button id="menu-toggle" aria-label="Abrir menu" style="background: none; border: none; color: var(--cor-texto); font-size: 1.75rem; cursor: pointer; display: none;">&#9776;</button>

        <nav id="nav-menu" class="nav" style="display: flex; gap: 1.5rem; align-items: center;">
          <a href="/pages/obras.html" style="color: var(--cor-texto); text-decoration: none; font-size: 0.95rem;">Acervo</a>
          <a href="/pages/exposicoes.html" style="color: var(--cor-texto); text-decoration: none; font-size: 0.95rem;">Exposições</a>
          <a href="/pages/eventos.html" style="color: var(--cor-texto); text-decoration: none; font-size: 0.95rem;">Eventos</a>
          <a href="/pages/ingressos.html" style="color: var(--cor-texto); text-decoration: none; font-size: 0.95rem;">Ingressos</a>
          <span id="header-usuario">
            ${usuario ? `<a href="/pages/perfil.html" style="color: var(--cor-destaque); text-decoration: none; font-weight: 500;">Olá, ${usuario.nome.split(' ')[0]}</a>` : `<a href="/pages/login.html" class="botao" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Entrar</a>`}
          </span>
        </nav>
      </div>
    </header>
  `;

  // Marcar link ativo
  const links = alvo.querySelectorAll('nav a');
  links.forEach((link) => {
    try {
      if (new URL(link.href).pathname === location.pathname) {
        link.style.color = 'var(--cor-destaque)';
      }
    } catch (e) {
      // Ignora links inválidos se houver
    }
  });

  // Lógica para abrir/fechar o menu no celular
  const btnToggle = alvo.querySelector('#menu-toggle');
  const navMenu = alvo.querySelector('#nav-menu');

  if (btnToggle && navMenu) {
    btnToggle.addEventListener('click', () => {
      const isOpen = navMenu.style.display === 'flex' && window.innerWidth <= 768;
      navMenu.style.display = isOpen ? 'none' : 'flex';
    });
  }
}
