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
    const imagemUrl = document.querySelector('#imagem_url');
    const previaImagem = document.querySelector('#previa-imagem');
    const erroImagem = document.querySelector('#erro-imagem');
    const emExibicao = document.querySelector('#em_exibicao');

    const parametros = new URLSearchParams(window.location.search);
    const idObra = parametros.get('id');
    const modoEdicao = idObra !== null;

    // Mostra a prévia do endereço digitado; se a imagem não carregar, avisa abaixo do campo.
    function atualizarPrevia() {
      const endereco = imagemUrl.value.trim();
      erroImagem.hidden = true;
      erroImagem.textContent = '';
      previaImagem.hidden = !endereco;
      if (endereco) previaImagem.src = endereco;
      else previaImagem.removeAttribute('src');
    }

    previaImagem.addEventListener('error', () => {
      if (!imagemUrl.value.trim()) return;
      previaImagem.hidden = true;
      erroImagem.textContent = 'Não foi possível carregar a imagem desse endereço.';
      erroImagem.hidden = false;
    });

    // Preencher as listas de artistas e categorias
    function preencherOpcoes(select, itens) {
      itens.forEach((item) => {
        const opcao = document.createElement('option');
        opcao.value = item.id;
        opcao.textContent = item.nome;
        select.appendChild(opcao);
      });
    }
    try {
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
          imagemUrl.value = obra.imagem_url ?? '';
          emExibicao.checked = obra.em_exibicao;
          atualizarPrevia();
        } else {
          mostrarToast('Obra não encontrada.', 'erro');
          formulario.hidden = true;
        }
      }
    } catch (erro) {
      const mensagemErro = document.getElementById('erro-formulario');
      mensagemErro.textContent = erro.message || 'Não foi possível carregar os dados da obra.';
      mensagemErro.hidden = false;
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
    imagemUrl.addEventListener('input', atualizarPrevia);

    // Cadastrar ou atualizar uma obra
    formulario.addEventListener('submit', async (evento) => {
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
        em_exibicao: emExibicao.checked,
      };
      botaoSalvar.disabled = true;
      try {
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
        const mensagemErro = document.getElementById('erro-formulario');
        mensagemErro.textContent = erro.message || 'Não foi possível salvar a obra.';
        mensagemErro.hidden = false;
      } finally {
        botaoSalvar.disabled = false;
      }
    }); // Fecha o evento submit
  } // Fecha a função carregarDados

  carregarDados();
} // Fecha o if (usuario)
