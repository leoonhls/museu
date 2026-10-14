// Responsável: M7 — veja a seção "M7 — Login e favoritos" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirLogin } from '../auth.js';

montarHeader();
montarFooter();

const usuario = exigirLogin();
if (usuario) {
  // TODO (M7):
  // - abas Meus dados, Favoritos e Minhas reservas
}
