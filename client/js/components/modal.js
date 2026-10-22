// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
// Provisório: o M2 troca o window.confirm por um <dialog> com a mesma assinatura.

export function confirmar(mensagem, aoConfirmar) {
  const dialog = document.createElement('dialog');
  dialog.style.backgroundColor = 'var(--cor-superficie)';
  dialog.style.color = 'var(--cor-texto)';
  dialog.style.border = '1px solid var(--cor-borda)';
  dialog.style.borderRadius = 'var(--raio)';
  dialog.style.padding = 'var(--espaco-3)';
  dialog.style.maxWidth = '400px';
  dialog.style.width = '100%';

  dialog.innerHTML = `
    <p style="margin-top: 0; font-size: 1.05rem; font-family: var(--fonte-texto);">${mensagem}</p>
    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: var(--espaco-3);">
      <button id="modal-cancelar" class="botao botao--secundario" style="padding: 0.5rem 1rem;">Cancelar</button>
      <button id="modal-confirmar" class="botao" style="padding: 0.5rem 1rem;">Confirmar</button>
    </div>
  `;

  document.body.appendChild(dialog);
  dialog.showModal();

  dialog.querySelector('#modal-cancelar').addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  dialog.querySelector('#modal-confirmar').addEventListener('click', () => {
    aoConfirmar();
    dialog.close();
    dialog.remove();
  });
}
