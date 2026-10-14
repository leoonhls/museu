// Responsável: M2 — veja a seção "M2 — Layout e design system" no Guia da Entrega 1
// Provisório: o M2 troca o window.confirm por um <dialog> com a mesma assinatura.
export function confirmar(mensagem, aoConfirmar) {
  if (window.confirm(mensagem)) aoConfirmar();
}
