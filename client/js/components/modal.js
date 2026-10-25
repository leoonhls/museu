// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
let contador = 0;

// Abre um <dialog> com Cancelar e Confirmar; aoConfirmar só roda se o usuário confirmar.
export function confirmar(mensagem, aoConfirmar) {
  contador += 1;
  const idMensagem = `modal-mensagem-${contador}`;

  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.setAttribute('aria-describedby', idMensagem);

  const texto = document.createElement('p');
  texto.className = 'modal__mensagem';
  texto.id = idMensagem;
  texto.textContent = mensagem;

  const cancelar = document.createElement('button');
  cancelar.type = 'button';
  cancelar.className = 'botao botao--secundario';
  cancelar.textContent = 'Cancelar';

  const confirmarBotao = document.createElement('button');
  confirmarBotao.type = 'button';
  confirmarBotao.className = 'botao';
  confirmarBotao.textContent = 'Confirmar';

  const acoes = document.createElement('div');
  acoes.className = 'modal__acoes';
  acoes.append(cancelar, confirmarBotao);

  dialog.append(texto, acoes);
  // Fechar por qualquer caminho (botões ou Esc) remove o diálogo da página.
  dialog.addEventListener('close', () => dialog.remove());
  cancelar.addEventListener('click', () => dialog.close());
  confirmarBotao.addEventListener('click', () => {
    dialog.close();
    aoConfirmar();
  });

  document.body.append(dialog);
  dialog.showModal();
  cancelar.focus();
}
