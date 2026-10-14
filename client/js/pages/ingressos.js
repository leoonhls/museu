// pages/ingressos.html — responsável: M6
import * as api from '/js/api.js';
import { exigirLogin } from '/js/auth.js';
import { montarHeader } from '/js/components/header.js';
import { montarFooter } from '/js/components/footer.js';

await exigirLogin();
await montarHeader(document.getElementById('header'));
montarFooter(document.getElementById('footer'));

// TODO (M6): implementar a página usando só funções do api.js.
