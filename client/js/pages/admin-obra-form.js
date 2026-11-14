// Responsável: M8 — veja a seção "M8 — Área administrativa" no Guia da Entrega 1

import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirAdmin } from '../auth.js';

import {
  listarArtistas,
  listarCategorias,
  buscarObra,
  criarObra,
  editarObra,
  enviarImagem,
} from '../api.js';

import { mostrarToast } from '../components/toast.js';

montarHeader();
montarFooter();

const usuario = await exigirAdmin();

if (usuario) {
  async function carregarDados() {
    const formulario = document.querySelector('#form-obra');
    const botaoSalvar = formulario.querySelector('button[type="submit"]');

    const titulo = document.querySelector('#titulo');
    const artista = document.querySelector('#artista');
    const categoria = document.querySelector('#categoria');
    const ano = document.querySelector('#ano');
    const tecnica = document.querySelector('#tecnica');
    const dimensoes = document.querySelector('#dimensoes');
    const descricao = document.querySelector('#descricao');
    const campoImagem = document.querySelector('#imagem');
    const previewImagem = document.querySelector('#preview-imagem');
    const emExibicao = document.querySelector('#em_exibicao');

    const parametros = new URLSearchParams(window.location.search);
    const idObra = parametros.get('id');
    const modoEdicao = idObra !== null;
    let imagemUrlAtual = '';

    // Preencher as listas de artistas e categorias
    function preencherOpcoes(select, itens) {
      itens.forEach((item) => {
        const opcao = document.createElement('option');
        opcao.value = item.id;
        opcao.textContent = item.nome;
        select.appendChild(opcao);
      });
    }

    preencherOpcoes(artista, await listarArtistas());
    preencherOpcoes(categoria, await listarCategorias());

    // Carregar os dados da obra no modo de edição
    if (modoEdicao) {
      const obra = await buscarObra(Number(idObra));

      if (obra) {
        titulo.value = obra.titulo;
        artista.value = obra.artista_id;
        categoria.value = obra.categoria_id;
        ano.value = obra.ano;
        tecnica.value = obra.tecnica;
        dimensoes.value = obra.dimensoes ?? '';
        descricao.value = obra.descricao;
        imagemUrlAtual = obra.imagem_url ?? '';
        emExibicao.checked = obra.em_exibicao;

        previewImagem.src = obra.imagem_url;
        previewImagem.hidden = false;
      } else {
        mostrarToast('Obra não encontrada.', 'erro');
        formulario.hidden = true;
      }
    }

    // Atualizar a prévia da imagem
    campoImagem.addEventListener('change', () => {
      const arquivo = campoImagem.files[0];

      if (arquivo) {
        previewImagem.src = URL.createObjectURL(arquivo);
        previewImagem.hidden = false;
      } else {
        previewImagem.src = imagemUrlAtual;
        previewImagem.hidden = !imagemUrlAtual;
      }
    });

    // Cadastrar ou atualizar uma obra
    formulario.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      if (formulario.hidden) {
        return;
      }
      const arquivoImagem = campoImagem.files[0];
      if (!modoEdicao && !arquivoImagem) {
        mostrarToast('Selecione uma imagem para cadastrar a obra.', 'erro');
        return;
      }
      if (
        arquivoImagem &&
        !['image/jpeg', 'image/png', 'image/webp'].includes(arquivoImagem.type)
      ) {
        mostrarToast('Selecione uma imagem JPEG, PNG ou WebP.', 'erro');
        return;
      }
      if (arquivoImagem && arquivoImagem.size > 2 * 1024 * 1024) {
        mostrarToast('A imagem deve ter no máximo 2 MB.', 'erro');
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
        imagem_url: imagemUrlAtual,
        em_exibicao: emExibicao.checked,
      };
      botaoSalvar.disabled = true;
      try {
        if (arquivoImagem) {
          dadosObra.imagem_url = await enviarImagem(arquivoImagem);
        }
        if (modoEdicao) {
          await editarObra(Number(idObra), dadosObra);
          mostrarToast('Obra atualizada com sucesso!', 'sucesso');
        } else {
          await criarObra(dadosObra);
          mostrarToast('Obra cadastrada com sucesso!', 'sucesso');
        }

        // Espera o toast aparecer antes de voltar para a lista.
        setTimeout(() => {
          window.location.href = 'obras.html';
        }, 1500);
      } catch (erro) {
        mostrarToast(erro.message, 'erro');
      } finally {
        botaoSalvar.disabled = false;
      }
    }); // Fecha o evento submit
  } // Fecha a função carregarDados

  carregarDados();
} // Fecha o if (usuario)
