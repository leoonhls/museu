// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
// tipo: 'sucesso' ou 'erro'

export function mostrarToast(mensagem, tipo = 'sucesso') {
  const toast = document.createElement('div');
  toast.textContent = mensagem;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = 'var(--raio)';
  toast.style.color = '#fff';
  toast.style.fontFamily = 'var(--fonte-texto)';
  toast.style.fontSize = '0.9rem';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  toast.style.backgroundColor = tipo === 'erro' ? '#991b1b' : '#065f46';

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
