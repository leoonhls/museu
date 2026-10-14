// Responsável: M6 — veja a seção "M6 — Ingressos" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirLogin } from '../auth.js';

montarHeader();
montarFooter();

const usuario = exigirLogin();
if (usuario) {
  // TODO (M6):
  // - formulário em 3 etapas
  // - validações
  // - criarReserva
  // - ir para o comprovante
}
