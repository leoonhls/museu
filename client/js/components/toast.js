// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
// tipo: 'sucesso' ou 'erro'
export function mostrarToast(mensagem, tipo = 'sucesso') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensagem;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 3000);
}
