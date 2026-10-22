// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1

export function montarFooter() {
  const alvo = document.querySelector('#footer');
  if (!alvo) return;

  alvo.innerHTML = `
    <footer style="background-color: var(--cor-superficie); border-top: 1px solid var(--cor-borda); padding: var(--espaco-4) 0; margin-top: var(--espaco-5); color: var(--cor-texto-suave); font-size: 0.9rem;">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--espaco-3);">
        <div>
          <h3 style="font-family: var(--fonte-titulo); color: var(--cor-texto); font-size: 1.1rem; margin-bottom: 0.25rem;">
            Museu de Artes
          </h3>
          <p style="margin: 0;">Preservando a expressão, a história e a cultura.</p>
        </div>
        <div>
          <p style="margin: 0; text-align: right;">
            &copy; 2026 Museu de Artes. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  `;
}
