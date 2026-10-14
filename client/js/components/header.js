// Header do site — responsável: M2
// Esqueleto mínimo para o site já ser navegável. M2 substitui pelo definitivo.
import { usuarioLogado, sair } from '/js/auth.js';

export async function montarHeader(elemento) {
  const usuario = await usuarioLogado();
  const links = [
    ['/', 'Início'],
    ['/pages/obras.html', 'Acervo'],
    ['/pages/exposicoes.html', 'Exposições'],
    ['/pages/eventos.html', 'Eventos'],
    ['/pages/ingressos.html', 'Ingressos'],
  ];
  if (usuario?.papel === 'admin') links.push(['/pages/admin/obras.html', 'Admin']);
  links.push(usuario ? ['/pages/perfil.html', usuario.nome] : ['/pages/login.html', 'Entrar']);

  elemento.innerHTML = `
    <header class="site-header">
      <a class="site-logo" href="/">Museu de Artes</a>
      <nav><ul>
        ${links.map(([href, texto]) => `<li><a href="${href}">${texto}</a></li>`).join('')}
        ${usuario ? '<li><button type="button" id="btn-sair">Sair</button></li>' : ''}
      </ul></nav>
    </header>`;

  elemento.querySelector('#btn-sair')?.addEventListener('click', async () => {
    await sair();
    location.href = '/';
  });
}
