// Responsável: M7 — veja a seção "M7 — Login e favoritos" no Guia da Entrega 1
import {
  atualizarPerfil,
  aplicarPreferenciasAcessibilidade,
  listarFavoritos,
  listarHistoricoConta,
  minhasReservas,
  obterPerfilUsuario,
  sair,
} from '../api.js';
import { criarListaReservas } from '../components/lista-reservas.js';
import { criarCardObra } from '../components/card-obra.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { exigirLogin } from '../auth.js';
import { formatarData, formatarDataHora } from '../utils/datas.js';
import { caminhoInicio, urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const usuario = exigirLogin();
if (usuario) {
  const abas = [...document.querySelectorAll('[data-aba]')];
  const paineis = {
    dados: document.getElementById('painelDados'),
    favoritos: document.getElementById('painelFavoritos'),
    reservas: document.getElementById('painelReservas'),
  };

  document.getElementById('perfilNome').textContent = usuario.nome;
  document.getElementById('perfilEmail').textContent = usuario.email;
  document.getElementById('perfilDataCadastro').textContent = formatarData(usuario.criado_em);

  const formPerfil = document.getElementById('formPerfil');
  const mensagemPerfil = document.getElementById('mensagemPerfil');
  const arquivoAvatar = document.getElementById('arquivoAvatar');
  const botaoSalvarPerfil = formPerfil.querySelector('[type="submit"]');
  const botaoRemoverAvatar = document.getElementById('removerAvatar');
  let avatarAtualizado = false;
  let avatarSelecionado = '';

  function mostrarAvatar(avatar) {
    const imagem = document.getElementById('perfilAvatar');
    const vazio = document.getElementById('perfilAvatarVazio');
    imagem.hidden = !avatar;
    vazio.hidden = Boolean(avatar);
    if (avatar) imagem.src = avatar;
    else imagem.removeAttribute('src');
  }

  function mostrarMensagemPerfil(texto, tipo) {
    mensagemPerfil.className = `mensagem mensagem--${tipo}`;
    mensagemPerfil.textContent = texto;
  }

  function renderizarHistorico() {
    const lista = document.getElementById('listaHistoricoConta');
    const itens = listarHistoricoConta();
    if (itens.length === 0) {
      const vazio = document.createElement('li');
      vazio.textContent = 'Nenhuma atividade registrada ainda.';
      lista.replaceChildren(vazio);
      return;
    }

    lista.replaceChildren(...itens.map((item) => {
      const linha = document.createElement('li');
      const descricao = document.createElement('span');
      const data = document.createElement('time');
      descricao.textContent = item.descricao;
      data.dateTime = item.data_hora;
      data.textContent = formatarDataHora(item.data_hora);
      linha.append(descricao, data);
      return linha;
    }));
  }

  const perfil = obterPerfilUsuario();
  document.getElementById('biografiaPerfil').value = perfil.biografia;
  document.getElementById('interessesPerfil').value = perfil.interesses;
  document.getElementById('telefonePerfil').value = perfil.telefone;
  document.getElementById('sitePerfil').value = perfil.site;
  document.getElementById('idiomaPerfil').value = perfil.idioma;
  document.getElementById('newsletterPerfil').checked = perfil.newsletter;
  document.getElementById('altoContrastePerfil').checked = perfil.acessibilidade.altoContraste;
  document.getElementById('reduzirAnimacoesPerfil').checked = perfil.acessibilidade.reduzirAnimacoes;
  mostrarAvatar(perfil.avatar);
  renderizarHistorico();

  arquivoAvatar.addEventListener('change', () => {
    const arquivo = arquivoAvatar.files[0];
    if (!arquivo) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(arquivo.type) || arquivo.size > 200_000) {
      mostrarMensagemPerfil('A foto deve ser PNG, JPEG ou WebP e ter no máximo 200 KB.', 'erro');
      arquivoAvatar.value = '';
      return;
    }

    botaoSalvarPerfil.disabled = true;
    botaoRemoverAvatar.disabled = true;
    const leitor = new FileReader();
    leitor.addEventListener('load', () => {
      botaoSalvarPerfil.disabled = false;
      botaoRemoverAvatar.disabled = false;
      if (typeof leitor.result !== 'string') {
        mostrarMensagemPerfil('Não foi possível carregar a foto selecionada.', 'erro');
        return;
      }
      avatarSelecionado = leitor.result;
      avatarAtualizado = true;
      mostrarAvatar(avatarSelecionado);
      mensagemPerfil.textContent = '';
      mensagemPerfil.className = 'mensagem';
    });
    leitor.addEventListener('error', () => {
      botaoSalvarPerfil.disabled = false;
      botaoRemoverAvatar.disabled = false;
      mostrarMensagemPerfil('Não foi possível carregar a foto selecionada.', 'erro');
    });
    leitor.readAsDataURL(arquivo);
  });

  botaoRemoverAvatar.addEventListener('click', () => {
    avatarSelecionado = '';
    avatarAtualizado = true;
    arquivoAvatar.value = '';
    mostrarAvatar('');
  });

  formPerfil.addEventListener('submit', (event) => {
    event.preventDefault();
    const dados = new FormData(formPerfil);
    try {
      atualizarPerfil({
        biografia: dados.get('biografia'),
        interesses: dados.get('interesses'),
        telefone: dados.get('telefone'),
        site: dados.get('site'),
        idioma: dados.get('idioma'),
        newsletter: dados.has('newsletter'),
        altoContraste: dados.has('altoContraste'),
        reduzirAnimacoes: dados.has('reduzirAnimacoes'),
        ...(avatarAtualizado ? { avatar: avatarSelecionado } : {}),
      });
      avatarAtualizado = false;
      aplicarPreferenciasAcessibilidade();
      renderizarHistorico();
      mostrarMensagemPerfil('Perfil atualizado com sucesso.', 'sucesso');
    } catch (erro) {
      mostrarMensagemPerfil(erro.message, 'erro');
    }
  });

  function exibirAba(nomeAba, atualizarUrl = true) {
    const aba = paineis[nomeAba] ? nomeAba : 'dados';
    abas.forEach((botao) => {
      const ativa = botao.dataset.aba === aba;
      botao.setAttribute('aria-selected', String(ativa));
      botao.tabIndex = ativa ? 0 : -1;
    });
    Object.entries(paineis).forEach(([nome, painel]) => {
      painel.hidden = nome !== aba;
    });

    if (aba === 'favoritos') renderizarFavoritos();
    if (aba === 'reservas') renderizarReservas();
    if (aba === 'dados') renderizarHistorico();

    if (atualizarUrl) {
      const url = new URL(location.href);
      url.searchParams.set('aba', aba);
      history.replaceState(null, '', url);
    }
  }

  function renderizarFavoritos() {
    const conteudo = document.getElementById('conteudoFavoritos');
    const obras = listarFavoritos();
    if (obras.length === 0) {
      const vazio = document.createElement('p');
      vazio.textContent = 'Você ainda não favoritou nenhuma obra.';
      const linkAcervo = document.createElement('a');
      linkAcervo.href = urlApp('pages/obras.html');
      linkAcervo.textContent = 'Explorar o acervo';
      conteudo.replaceChildren(vazio, linkAcervo);
      return;
    }

    const grade = document.createElement('div');
    grade.className = 'grid perfil__favoritos';
    grade.append(...obras.map(criarCardObra));
    conteudo.replaceChildren(grade);
  }

  function renderizarReservas() {
    const conteudo = document.getElementById('conteudoReservas');
    conteudo.replaceChildren(criarListaReservas(minhasReservas(), renderizarReservas));
  }

  abas.forEach((botao) => {
    botao.addEventListener('click', () => exibirAba(botao.dataset.aba));
  });

  window.addEventListener('popstate', () => {
    exibirAba(new URLSearchParams(location.search).get('aba'), false);
  });

  document.getElementById('botaoSairPerfil').addEventListener('click', () => {
    sair();
    location.href = caminhoInicio();
  });

  exibirAba(new URLSearchParams(location.search).get('aba'), false);
}
