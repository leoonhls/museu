// Responsável: M8 — veja a seção "M8 — Área administrativa" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirAdmin } from '../auth.js';

montarHeader();
montarFooter();

const usuario = exigirAdmin();
if (usuario) {
  // TODO (M8):
  // - tabela com busca e paginação
  // - editar
  // - excluir com confirmar()
}
