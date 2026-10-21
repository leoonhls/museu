// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
// Provisório: o M2 troca o window.confirm por um <dialog> com a mesma assinatura.

export function confirmar(mensagem, aoConfirmar) {
  // Remove modal anterior se já existir na DOM
  const dialogoAntigo = document.getElementById('modal-confirmacao');
  if (dialogoAntigo) dialogoAntigo.remove();

  const dialog = document.createElement('dialog');
  dialog.id = 'modal-confirmacao';
  dialog.className = 'card';
  dialog.style.padding = 'var(--espaco-3)';
  dialog.style.border = '1px solid var(--cor-borda)';
  dialog.style.borderRadius = 'var(--raio)';
  dialog.style.maxWidth = '400px';
  dialog.style.width = '100%';
  dialog.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';

  dialog.innerHTML = `
    <p style="margin-bottom: var(--espaco-3); font-size: 1.05rem; font-weight: 500;">${mensagem}</p>
    <div style="display: flex; justify-content: flex-end; gap: var(--espaco-2);">
      <button type="button" id="btn-cancelar" class="botao botao--secundario">Cancelar</button>
      <button type="button" id="btn-confirmar" class="botao">Confirmar</button>
    </div>
  `;

  document.body.append(dialog);

  const btnCancelar = dialog.querySelector('#btn-cancelar');
  const btnConfirmar = dialog.querySelector('#btn-confirmar');

  dialog.showModal();

  btnCancelar.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  btnConfirmar.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
    aoConfirmar();
  });
}

//export function confirmar(mensagem, aoConfirmar) {
// if (window.confirm(mensagem)) aoConfirmar();
//}
