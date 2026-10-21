// Responsável: M3 — veja a seção "M3 — Galeria" no Guia da Entrega 1
import { listarObras } from '../api.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { criarCardObra } from '../components/card-obra.js';

montarHeader();
montarFooter();

const grade = document.getElementById('gradeObras');
const resumo = document.getElementById('resumoObras');

try {
  const resultado = listarObras();
  grade.replaceChildren(...resultado.dados.map(criarCardObra));
  resumo.textContent = resultado.total
    ? `${resultado.total} ${resultado.total === 1 ? 'obra disponível' : 'obras disponíveis'} no acervo.`
    : 'Nenhuma obra está disponível no acervo no momento.';
} catch (erro) {
  resumo.textContent = `Não foi possível carregar o acervo: ${erro.message}`;
  resumo.classList.add('galeria__erro');
}
