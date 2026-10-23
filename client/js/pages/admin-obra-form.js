// Responsável: M8 — veja a seção "M8 — Área administrativa" no Guia da Entrega 1

/* Responsável: M8 — Área administrativa */

import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirAdmin } from '../auth.js';

import {
  listarArtistas,
  listarCategorias,
  buscarObra,
  criarObra,
  editarObra
} from '../api.js';

import { mostrarToast } from '../components/toast.js';

montarHeader();
montarFooter();

const usuario = exigirAdmin();

if (usuario) {
  const formulario = document.querySelector('#form-obra');

  const titulo = document.querySelector('#titulo');
  const artista = document.querySelector('#artista');
  const categoria = document.querySelector('#categoria');
  const ano = document.querySelector('#ano');
  const tecnica = document.querySelector('#tecnica');
  const dimensoes = document.querySelector('#dimensoes');
  const descricao = document.querySelector('#descricao');
  const imagemUrl = document.querySelector('#imagem_url');
  const previewImagem = document.querySelector('#preview-imagem');
  const emExibicao = document.querySelector('#em_exibicao');

  const parametros = new URLSearchParams(window.location.search);
  const idObra = parametros.get('id');
  const modoEdicao = idObra !== null;

  // Preencher as listas de artistas e categorias
  function preencherOpcoes(select, itens) {
    itens.forEach((item) => {
      const opcao = document.createElement('option');
      opcao.value = item.id;
      opcao.textContent = item.nome;
      select.appendChild(opcao);
    });
  }

  preencherOpcoes(artista, listarArtistas());
  preencherOpcoes(categoria, listarCategorias());

  // Carregar os dados da obra no modo de edição
  if (modoEdicao) {
    const obra = buscarObra(Number(idObra));

    if (obra) {
      titulo.value = obra.titulo;
      artista.value = obra.artista_id;
      categoria.value = obra.categoria_id;
      ano.value = obra.ano;
      tecnica.value = obra.tecnica;
      dimensoes.value = obra.dimensoes ?? '';
      descricao.value = obra.descricao;
      imagemUrl.value = obra.imagem_url;
      emExibicao.checked = obra.em_exibicao;

      previewImagem.src = obra.imagem_url;
      previewImagem.hidden = false;
    } else {
      mostrarToast('Obra não encontrada.', 'erro');
      formulario.hidden = true;
    }
  }

  // Atualizar a prévia da imagem
  imagemUrl.addEventListener('input', () => {
    const url = imagemUrl.value.trim();
    previewImagem.hidden = !url;

    if (url) {
      previewImagem.src = url;
    }
  });

  // Cadastrar ou atualizar uma obra
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (formulario.hidden) {
      return;
    }

    const dadosObra = {
      titulo: titulo.value.trim(),
      artista_id: Number(artista.value),
      categoria_id: Number(categoria.value),
      ano: Number(ano.value),
      tecnica: tecnica.value.trim(),
      dimensoes: dimensoes.value.trim(),
      descricao: descricao.value.trim(),
      imagem_url: imagemUrl.value.trim(),
      em_exibicao: emExibicao.checked
    };

    try {
      if (modoEdicao) {
        editarObra(Number(idObra), dadosObra);
        mostrarToast('Obra atualizada com sucesso!', 'sucesso');
      } else {
        criarObra(dadosObra);
        mostrarToast('Obra cadastrada com sucesso!', 'sucesso');
      }

      window.location.href = 'obras.html';
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
    }
  });
}

