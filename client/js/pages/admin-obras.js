// Responsável: M8 — veja a seção "M8 — Área administrativa" no Guia da Entrega 1
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirAdmin } from '../auth.js';

import { listarObras, excluirObra } from '../api.js';
import { confirmar } from '../components/modal.js';
import { mostrarToast } from '../components/toast.js';


montarHeader();
montarFooter();

const usuario = exigirAdmin();

if (usuario) {
  const campoBusca = document.querySelector('#busca-obras');
  const tabela = document.querySelector('#lista-obras');
  const anterior = document.querySelector('#pagina-anterior');
  const proxima = document.querySelector('#proxima-pagina');
  const infoPagina = document.querySelector('#info-pagina');

  let pagina = 1;

  function carregarObras() {
    try {
      const resultado = listarObras({
        busca: campoBusca.value.trim(),
        pagina
      });

      const totalPaginas = Math.max(
        1,
        Math.ceil(resultado.total / resultado.porPagina)
      );

      if (pagina > totalPaginas) {
        pagina = totalPaginas;
        carregarObras();
        return;
      }

      tabela.replaceChildren();

      for (const obra of resultado.dados) {
        const linha = document.createElement('tr');

        const valores = [
          obra.imagem_url,
          obra.titulo,
          obra.artista_nome ?? 'Não informado',
          obra.categoria_nome ?? 'Não informada',
          obra.ano,
          obra.em_exibicao ? 'Sim' : 'Não'
        ];

        valores.forEach((valor, indice) => {
          const celula = document.createElement('td');

          if (indice === 0) {
            const imagem = document.createElement('img');
            imagem.src = valor;
            imagem.alt = obra.titulo;
            imagem.width = 60;
            imagem.loading = 'lazy';
            celula.appendChild(imagem);
          } else {
            celula.textContent = valor;
          }

          linha.appendChild(celula);
        });

        const acoes = document.createElement('td');
        const editar = document.createElement('a');

        editar.href = `obra-form.html?id=${obra.id}`;
        editar.textContent = 'Editar';
        editar.className = 'botao botao--secundario';

        acoes.appendChild(editar);

        const excluir = document.createElement('button');
        excluir.type = 'button';
        excluir.className = 'botao';
        excluir.textContent = 'Excluir';

        excluir.addEventListener('click', () => {
          confirmar(`Deseja excluir a obra "${obra.titulo}"?`, () => {
            try {
              excluirObra(obra.id);
              mostrarToast('Obra excluída com sucesso!', 'sucesso');
              carregarObras();
            } catch (erro) {
              mostrarToast(erro.message, 'erro');
            }
          });
        });

        acoes.appendChild(excluir);

        linha.appendChild(acoes);
        tabela.appendChild(linha);
      }

      if (resultado.total === 0) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 7;
        celula.textContent = 'Nenhuma obra encontrada.';

        linha.appendChild(celula);
        tabela.appendChild(linha);
      }

      infoPagina.textContent = `Página ${pagina} de ${totalPaginas}`;
      anterior.disabled = pagina <= 1;
      proxima.disabled = pagina >= totalPaginas;

    } catch (erro) {
      tabela.replaceChildren();
      infoPagina.textContent = erro.message;
    }
  }

  campoBusca.addEventListener('input', () => {
    pagina = 1;
    carregarObras();
  });

  anterior.addEventListener('click', () => {
    if (pagina > 1) {
      pagina--;
      carregarObras();
    }
  });

  proxima.addEventListener('click', () => {
    pagina++;
    carregarObras();
  });

  carregarObras();
}
