// Responsável: M1 — único ponto de acesso a dados (client/data/ e localStorage)
//
// Todas as funções são síncronas. Em caso de problema, lançam
// new Error(mensagem) com um texto em português pronto para o usuário:
//   try { api.criarReserva(dados); } catch (erro) { mostrarToast(erro.message, 'erro'); }

import { obras as obrasArquivo } from '../data/obras.js';
import { artistas as artistasArquivo } from '../data/artistas.js';
import { categorias as categoriasArquivo } from '../data/categorias.js';
import { exposicoes as exposicoesArquivo } from '../data/exposicoes.js';
import { exposicaoObras } from '../data/exposicao_obras.js';
import { eventos as eventosArquivo } from '../data/eventos.js';
import { PRECO_INTEIRA, MAX_INGRESSOS, DIAS_ANTECEDENCIA_MAX, DIA_FECHADO } from './config.js';

const PREFIXO = 'museu:';
const POR_PAGINA = 12;
const CARACTERES_CODIGO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

// Lê uma chave do localStorage. Dado ausente, corrompido ou de tipo
// diferente do padrão (lista x objeto) devolve o padrão.
function ler(chave, padrao) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave);
    if (texto === null) return padrao;
    const valor = JSON.parse(texto);
    if (valor === null) return padrao;
    if (padrao === null) return valor;
    if (Array.isArray(padrao) !== Array.isArray(valor) || typeof padrao !== typeof valor)
      return padrao;
    return valor;
  } catch {
    return padrao;
  }
}

function gravar(chave, valor) {
  localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
}

function remover(chave) {
  localStorage.removeItem(PREFIXO + chave);
}

// Filtro vazio vindo de formulário ou da URL.
function vazio(valor) {
  return valor === '' || valor === null || valor === undefined;
}

// Texto sem acentos e em minúsculas, para buscas.
function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function textoData(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// 'AAAA-MM-DD' como data local, sem hora.
function dataLocal(texto) {
  return new Date(`${texto}T00:00:00`);
}

function hoje() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

function somarDias(data, dias) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);
}

function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
}

function compararTexto(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function exigirUsuario() {
  const usuario = usuarioAtual();
  if (!usuario) throw new Error('Faça login para continuar.');
  return usuario;
}

function exigirAdminApi() {
  const usuario = usuarioAtual();
  if (!usuario || usuario.papel !== 'admin') throw new Error('Acesso restrito ao administrador.');
  return usuario;
}

// ---------------------------------------------------------------------------
// Dados combinados (arquivo + localStorage)
// ---------------------------------------------------------------------------

function usuarios() {
  const lista = ler('usuarios', null);
  if (Array.isArray(lista)) return lista;
  const semente = [
    {
      id: 1,
      nome: 'Administrador',
      email: 'admin@museu.com',
      senha: 'admin123',
      papel: 'admin',
      criado_em: textoData(hoje()),
    },
  ];
  gravar('usuarios', semente);
  return semente;
}

function semSenha(usuario) {
  const { senha, ...resto } = usuario;
  return resto;
}

function perfilPadrao() {
  return {
    avatar: '',
    biografia: '',
    interesses: '',
    telefone: '',
    site: '',
    idioma: 'pt-BR',
    newsletter: false,
    acessibilidade: {
      altoContraste: false,
      reduzirAnimacoes: false,
    },
  };
}

function registrarHistoricoConta(usuarioId, tipo, descricao) {
  const historico = ler('historico_conta', []);
  gravar('historico_conta', [
    ...historico,
    { usuario_id: usuarioId, tipo, descricao, data_hora: new Date().toISOString() },
  ].slice(-1000));
}

// Obras do arquivo com as edições aplicadas, mais as criadas, menos as excluídas.
function obrasVisiveis() {
  const editadas = ler('obras_editadas', {});
  const criadas = ler('obras_criadas', []);
  const excluidas = ler('obras_excluidas', []);
  return [...obrasArquivo.map((obra) => editadas[obra.id] ?? obra), ...criadas].filter(
    (obra) => !excluidas.includes(obra.id),
  );
}

function comNomes(obra) {
  const artista = artistasArquivo.find((a) => a.id === obra.artista_id);
  const categoria = categoriasArquivo.find((c) => c.id === obra.categoria_id);
  return {
    ...obra,
    artista_nome: artista ? artista.nome : null,
    categoria_nome: categoria ? categoria.nome : null,
  };
}

function statusExposicao(exposicao) {
  const dia = hoje();
  if (dataLocal(exposicao.data_inicio) > dia) return 'futura';
  if (dataLocal(exposicao.data_fim) < dia) return 'passada';
  return 'atual';
}

function vagasRestantes(evento, reservas) {
  const ocupadas = reservas
    .filter((r) => r.evento_id === evento.id && r.status === 'confirmada')
    .reduce((soma, r) => soma + r.qtd_inteira + r.qtd_meia, 0);
  return Math.max(0, evento.capacidade - ocupadas);
}

function comVagas(evento, reservas) {
  return { ...evento, vagas_restantes: vagasRestantes(evento, reservas) };
}

function porDataHora(a, b) {
  return new Date(a.data_hora) - new Date(b.data_hora);
}

// ---------------------------------------------------------------------------
// Leitura: obras, artistas, categorias
// ---------------------------------------------------------------------------

// Filtros: categoria e artista são ids; anoMin e anoMax incluem o próprio ano.
export function listarObras({ busca, categoria, artista, anoMin, anoMax, ordem, pagina } = {}) {
  let lista = obrasVisiveis().map(comNomes);

  if (!vazio(busca)) {
    const termo = normalizar(busca).trim();
    lista = lista.filter(
      (obra) =>
        normalizar(obra.titulo).includes(termo) || normalizar(obra.artista_nome).includes(termo),
    );
  }
  if (!vazio(categoria)) lista = lista.filter((obra) => obra.categoria_id === Number(categoria));
  if (!vazio(artista)) lista = lista.filter((obra) => obra.artista_id === Number(artista));
  if (!vazio(anoMin)) lista = lista.filter((obra) => obra.ano >= Number(anoMin));
  if (!vazio(anoMax)) lista = lista.filter((obra) => obra.ano <= Number(anoMax));

  if (ordem === 'antigas') {
    lista.sort((a, b) => a.ano - b.ano || compararTexto(a.titulo, b.titulo));
  } else if (ordem === 'recentes') {
    lista.sort((a, b) => b.ano - a.ano || compararTexto(a.titulo, b.titulo));
  } else {
    lista.sort((a, b) => compararTexto(a.titulo, b.titulo));
  }

  const paginaAtual = Math.max(1, Math.trunc(Number(pagina)) || 1);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  return {
    dados: lista.slice(inicio, inicio + POR_PAGINA),
    total: lista.length,
    pagina: paginaAtual,
    porPagina: POR_PAGINA,
  };
}

export function buscarObra(id) {
  const obra = obrasVisiveis().find((o) => o.id === Number(id));
  if (!obra) return null;

  const artista = artistasArquivo.find((a) => a.id === obra.artista_id);
  const categoria = categoriasArquivo.find((c) => c.id === obra.categoria_id);
  const idsExposicoes = exposicaoObras
    .filter((eo) => eo.obra_id === obra.id)
    .map((eo) => eo.exposicao_id);
  const exposicoes = exposicoesArquivo
    .filter((e) => idsExposicoes.includes(e.id))
    .map((e) => ({ ...e }));

  return {
    ...comNomes(obra),
    artista: artista ? { ...artista } : null,
    categoria: categoria ? { ...categoria } : null,
    exposicoes,
  };
}

export function listarArtistas() {
  return artistasArquivo.map((a) => ({ ...a })).sort((a, b) => compararTexto(a.nome, b.nome));
}

export function buscarArtista(id) {
  const artista = artistasArquivo.find((a) => a.id === Number(id));
  if (!artista) return null;
  const obras = obrasVisiveis()
    .filter((o) => o.artista_id === artista.id)
    .map(comNomes)
    .sort((a, b) => a.ano - b.ano);
  return { ...artista, obras };
}

export function listarCategorias() {
  return categoriasArquivo.map((c) => ({ ...c }));
}

// ---------------------------------------------------------------------------
// Leitura: exposições e eventos
// ---------------------------------------------------------------------------

// status: 'atual', 'futura' ou 'passada'
export function listarExposicoes({ status } = {}) {
  let lista = exposicoesArquivo.map((e) => ({ ...e, status: statusExposicao(e) }));
  if (!vazio(status)) lista = lista.filter((e) => e.status === status);
  return lista.sort((a, b) => dataLocal(a.data_inicio) - dataLocal(b.data_inicio));
}

export function buscarExposicao(id) {
  const exposicao = exposicoesArquivo.find((e) => e.id === Number(id));
  if (!exposicao) return null;

  const idsObras = exposicaoObras
    .filter((eo) => eo.exposicao_id === exposicao.id)
    .map((eo) => eo.obra_id);
  const obras = obrasVisiveis()
    .filter((o) => idsObras.includes(o.id))
    .map(comNomes);
  const eventos = eventosArquivo
    .filter((ev) => ev.exposicao_id === exposicao.id)
    .map((ev) => ({ ...ev }))
    .sort(porDataHora);

  return { ...exposicao, status: statusExposicao(exposicao), obras, eventos };
}

// de e ate aceitam 'AAAA-MM-DD' ou 'AAAA-MM-DDTHH:MM:SS'. Uma data sem hora
// em ate inclui o dia inteiro.
export function listarEventos({ de, ate } = {}) {
  const inicio = vazio(de)
    ? new Date()
    : new Date(String(de).length === 10 ? `${de}T00:00:00` : de);
  const fim = vazio(ate) ? null : new Date(String(ate).length === 10 ? `${ate}T23:59:59` : ate);
  const reservas = ler('reservas', []);

  return eventosArquivo
    .filter((ev) => {
      const quando = new Date(ev.data_hora);
      return quando >= inicio && (!fim || quando <= fim);
    })
    .map((ev) => comVagas(ev, reservas))
    .sort(porDataHora);
}

// ---------------------------------------------------------------------------
// Conta
// ---------------------------------------------------------------------------

export function cadastrar({ nome, email, senha, tipoCadastro = 'visitante' } = {}) {
  const nomeLimpo = String(nome ?? '').trim();
  const emailLimpo = String(email ?? '')
    .trim()
    .toLowerCase();
  const senhaTexto = String(senha ?? '');
  const tiposCadastro = ['estudante', 'pesquisador', 'administrador', 'visitante'];
  const tipoCadastroLimpo = String(tipoCadastro ?? '');

  if (nomeLimpo.length < 3) throw new Error('O nome deve ter pelo menos 3 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) throw new Error('Informe um e-mail válido.');
  if (!tiposCadastro.includes(tipoCadastroLimpo)) throw new Error('Selecione um tipo de cadastro válido.');
  if (senhaTexto.length < 8 || !/[a-zA-Z]/.test(senhaTexto) || !/\d/.test(senhaTexto)) {
    throw new Error('A senha deve ter pelo menos 8 caracteres, com letras e números.');
  }

  const lista = usuarios();
  if (lista.some((u) => u.email === emailLimpo)) throw new Error('Este e-mail já está cadastrado.');

  const usuario = {
    id: proximoId(lista),
    nome: nomeLimpo,
    email: emailLimpo,
    senha: senhaTexto,
    tipo_cadastro: tipoCadastroLimpo,
    papel: 'visitante',
    criado_em: textoData(hoje()),
    perfil: perfilPadrao(),
  };
  gravar('usuarios', [...lista, usuario]);
  gravar('sessao', usuario.id);
  registrarHistoricoConta(usuario.id, 'cadastro', 'Conta criada.');
  return semSenha(usuario);
}

export function entrar(email, senha) {
  const emailLimpo = String(email ?? '')
    .trim()
    .toLowerCase();
  const usuario = usuarios().find((u) => u.email === emailLimpo && u.senha === String(senha ?? ''));
  if (!usuario) throw new Error('E-mail ou senha incorretos.');
  gravar('sessao', usuario.id);
  registrarHistoricoConta(usuario.id, 'login', 'Entrada na conta.');
  return semSenha(usuario);
}

export function redefinirSenha(email, novaSenha) {
  const emailLimpo = String(email ?? '')
    .trim()
    .toLowerCase();
  const senhaTexto = String(novaSenha ?? '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) throw new Error('Informe um e-mail válido.');
  if (senhaTexto.length < 8 || !/[a-zA-Z]/.test(senhaTexto) || !/\d/.test(senhaTexto)) {
    throw new Error('A senha deve ter pelo menos 8 caracteres, com letras e números.');
  }

  const lista = usuarios();
  const indice = lista.findIndex((usuario) => usuario.email === emailLimpo);
  if (indice === -1) throw new Error('Não encontramos uma conta com esse e-mail.');

  const atualizados = [...lista];
  atualizados[indice] = { ...atualizados[indice], senha: senhaTexto };
  gravar('usuarios', atualizados);
  registrarHistoricoConta(atualizados[indice].id, 'senha', 'Senha redefinida.');
}

export function sair() {
  const usuario = usuarioAtual();
  if (usuario) registrarHistoricoConta(usuario.id, 'logout', 'Saída da conta.');
  remover('sessao');
}

export function usuarioAtual() {
  const id = ler('sessao', null);
  if (id === null) return null;
  const usuario = usuarios().find((u) => u.id === id);
  return usuario ? semSenha(usuario) : null;
}

export function obterPerfilUsuario() {
  const usuario = exigirUsuario();
  return { ...perfilPadrao(), ...(usuario.perfil ?? {}), acessibilidade: {
    ...perfilPadrao().acessibilidade,
    ...(usuario.perfil?.acessibilidade ?? {}),
  } };
}

export function atualizarPerfil(dados = {}) {
  const usuario = exigirUsuario();
  const perfilAtual = obterPerfilUsuario();
  const biografia = String(dados.biografia ?? '').trim();
  const interesses = String(dados.interesses ?? '').trim();
  const telefone = String(dados.telefone ?? '').trim();
  const site = String(dados.site ?? '').trim();
  const idioma = String(dados.idioma ?? perfilAtual.idioma);
  const idiomasPermitidos = ['pt-BR', 'en', 'es'];

  if (biografia.length > 500) throw new Error('A biografia deve ter no máximo 500 caracteres.');
  if (interesses.length > 500) throw new Error('Os interesses devem ter no máximo 500 caracteres.');
  if (telefone.length > 30) throw new Error('O telefone deve ter no máximo 30 caracteres.');
  if (site.length > 200) throw new Error('O endereço do site deve ter no máximo 200 caracteres.');
  if (site) {
    let url;
    try {
      url = new URL(site);
    } catch {
      throw new Error('Informe um endereço de site válido, começando com https://.');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('O endereço do site deve começar com http:// ou https://.');
    }
  }
  if (!idiomasPermitidos.includes(idioma)) throw new Error('Selecione um idioma válido.');

  const avatar = dados.avatar === undefined ? perfilAtual.avatar : String(dados.avatar);
  if (
    avatar &&
    (avatar.length > 1_400_000 ||
      !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar))
  ) {
    throw new Error('A foto deve ser PNG, JPEG ou WebP e ter no máximo 1 MB.');
  }

  const perfil = {
    avatar,
    biografia,
    interesses,
    telefone,
    site,
    idioma,
    newsletter: dados.newsletter === true,
    acessibilidade: {
      altoContraste: dados.altoContraste === true,
      reduzirAnimacoes: dados.reduzirAnimacoes === true,
    },
  };
  const lista = usuarios();
  const indice = lista.findIndex((item) => item.id === usuario.id);
  if (indice === -1) throw new Error('Não encontramos a conta conectada.');
  const atualizados = [...lista];
  atualizados[indice] = { ...atualizados[indice], perfil };
  gravar('usuarios', atualizados);
  registrarHistoricoConta(usuario.id, 'perfil', 'Perfil atualizado.');
  return { ...perfil, acessibilidade: { ...perfil.acessibilidade } };
}

export function listarHistoricoConta() {
  const usuario = exigirUsuario();
  return ler('historico_conta', [])
    .filter((item) => item.usuario_id === usuario.id)
    .sort((a, b) => b.data_hora.localeCompare(a.data_hora))
    .slice(0, 50)
    .map(({ tipo, descricao, data_hora }) => ({ tipo, descricao, data_hora }));
}

export function aplicarPreferenciasAcessibilidade() {
  const usuario = usuarioAtual();
  const acessibilidade = usuario?.perfil?.acessibilidade ?? perfilPadrao().acessibilidade;
  document.documentElement.dataset.altoContraste = String(Boolean(acessibilidade.altoContraste));
  document.documentElement.dataset.reduzirAnimacoes = String(Boolean(acessibilidade.reduzirAnimacoes));
}

// ---------------------------------------------------------------------------
// Favoritos
// ---------------------------------------------------------------------------

// Lista simples (sem paginação) das obras favoritas, mais recentes primeiro.
export function listarFavoritos() {
  const usuario = exigirUsuario();
  const obras = obrasVisiveis();
  return ler('favoritos', [])
    .filter((f) => f.usuario_id === usuario.id)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .map((f) => obras.find((o) => o.id === f.obra_id))
    .filter(Boolean)
    .map(comNomes);
}

function exigirObraExistente(obraId) {
  const id = Number(obraId);
  if (!obrasVisiveis().some((o) => o.id === id)) throw new Error('Obra não encontrada.');
  return id;
}

export function favoritar(obraId) {
  const usuario = exigirUsuario();
  const id = exigirObraExistente(obraId);
  const favoritos = ler('favoritos', []);
  if (favoritos.some((f) => f.usuario_id === usuario.id && f.obra_id === id)) return;
  gravar('favoritos', [
    ...favoritos,
    { usuario_id: usuario.id, obra_id: id, criado_em: new Date().toISOString() },
  ]);
  const obra = obrasVisiveis().find((item) => item.id === id);
  registrarHistoricoConta(usuario.id, 'favorito', `Obra adicionada aos favoritos: ${obra.titulo}.`);
}

export function desfavoritar(obraId) {
  const usuario = exigirUsuario();
  const id = exigirObraExistente(obraId);
  const favoritos = ler('favoritos', []);
  gravar(
    'favoritos',
    favoritos.filter((f) => !(f.usuario_id === usuario.id && f.obra_id === id)),
  );
  const obra = obrasVisiveis().find((item) => item.id === id);
  registrarHistoricoConta(usuario.id, 'favorito', `Obra removida dos favoritos: ${obra.titulo}.`);
}

// ---------------------------------------------------------------------------
// Reservas
// ---------------------------------------------------------------------------

function gerarCodigo(reservas) {
  let codigo;
  do {
    codigo = 'MUS-';
    for (let i = 0; i < 5; i++) {
      codigo += CARACTERES_CODIGO[Math.floor(Math.random() * CARACTERES_CODIGO.length)];
    }
  } while (reservas.some((r) => r.codigo === codigo));
  return codigo;
}

function quantidade(valor) {
  return vazio(valor) ? 0 : Number(valor);
}

export function criarReserva({ evento_id, data_visita, qtd_inteira, qtd_meia } = {}) {
  const usuario = exigirUsuario();
  const reservas = ler('reservas', []);

  // 1. Quantidades
  const inteira = quantidade(qtd_inteira);
  const meia = quantidade(qtd_meia);
  if (!Number.isInteger(inteira) || !Number.isInteger(meia) || inteira < 0 || meia < 0) {
    throw new Error('As quantidades de ingressos devem ser números inteiros e não negativos.');
  }
  const total = inteira + meia;
  if (total < 1) throw new Error('Escolha pelo menos 1 ingresso.');
  if (total > MAX_INGRESSOS)
    throw new Error(`O máximo é de ${MAX_INGRESSOS} ingressos por reserva.`);

  let evento = null;
  let data;

  if (!vazio(evento_id)) {
    // 2. Evento
    evento = eventosArquivo.find((ev) => ev.id === Number(evento_id));
    if (!evento) throw new Error('Evento não encontrado.');
    if (new Date(evento.data_hora) <= new Date()) throw new Error('Este evento já aconteceu.');
    const vagas = vagasRestantes(evento, reservas);
    if (vagas === 0) throw new Error('Evento esgotado.');
    if (total > vagas) throw new Error(`Restam apenas ${vagas} vagas para este evento.`);
    data = evento.data_hora.slice(0, 10);
  } else {
    // 3. Visita comum
    const dia = /^\d{4}-\d{2}-\d{2}$/.test(String(data_visita ?? ''))
      ? dataLocal(data_visita)
      : null;
    if (!dia || Number.isNaN(dia.getTime()) || textoData(dia) !== data_visita) {
      throw new Error('Escolha uma data válida para a visita.');
    }
    if (dia < somarDias(hoje(), 1))
      throw new Error('A visita deve ser marcada a partir de amanhã.');
    if (dia > somarDias(hoje(), DIAS_ANTECEDENCIA_MAX)) {
      throw new Error(
        `A visita pode ser marcada com até ${DIAS_ANTECEDENCIA_MAX} dias de antecedência.`,
      );
    }
    if (dia.getDay() === DIA_FECHADO) throw new Error('O museu fecha às segundas-feiras.');
    data = data_visita;
  }

  const base = evento ? Number(evento.preco) : PRECO_INTEIRA;
  const reserva = {
    id: proximoId(reservas),
    codigo: gerarCodigo(reservas),
    usuario_id: usuario.id,
    evento_id: evento ? evento.id : null,
    data_visita: data,
    qtd_inteira: inteira,
    qtd_meia: meia,
    valor_total: Math.round((inteira * base + (meia * base) / 2) * 100) / 100,
    status: 'confirmada',
    criado_em: new Date().toISOString(),
  };
  gravar('reservas', [...reservas, reserva]);
  registrarHistoricoConta(usuario.id, 'reserva', `Reserva ${reserva.codigo} criada.`);
  return { ...reserva };
}

export function minhasReservas() {
  const usuario = exigirUsuario();
  return ler('reservas', [])
    .filter((r) => r.usuario_id === usuario.id)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id)
    .map((r) => {
      const evento = eventosArquivo.find((ev) => ev.id === r.evento_id);
      return { ...r, evento_titulo: evento ? evento.titulo : null };
    });
}

export function cancelarReserva(id) {
  const usuario = exigirUsuario();
  const reservas = ler('reservas', []);
  const reserva = reservas.find((r) => r.id === Number(id) && r.usuario_id === usuario.id);
  if (!reserva) throw new Error('Reserva não encontrada.');
  if (reserva.status === 'cancelada') throw new Error('Esta reserva já foi cancelada.');

  const evento = eventosArquivo.find((ev) => ev.id === reserva.evento_id);
  const passou = evento
    ? new Date(evento.data_hora) <= new Date()
    : dataLocal(reserva.data_visita) < hoje();
  if (passou) throw new Error('Não é possível cancelar uma reserva cuja data já passou.');

  reserva.status = 'cancelada';
  gravar('reservas', reservas);
  registrarHistoricoConta(usuario.id, 'reserva', `Reserva ${reserva.codigo} cancelada.`);
}

// ---------------------------------------------------------------------------
// Administração de obras
// ---------------------------------------------------------------------------

function validarObra(dados = {}) {
  const anoAtual = new Date().getFullYear();

  const titulo = String(dados.titulo ?? '').trim();
  if (titulo.length < 1 || titulo.length > 150)
    throw new Error('O título deve ter de 1 a 150 caracteres.');

  const artista_id = Number(dados.artista_id);
  if (vazio(dados.artista_id) || !artistasArquivo.some((a) => a.id === artista_id)) {
    throw new Error('Escolha um artista válido.');
  }

  const categoria_id = Number(dados.categoria_id);
  if (vazio(dados.categoria_id) || !categoriasArquivo.some((c) => c.id === categoria_id)) {
    throw new Error('Escolha uma categoria válida.');
  }

  const ano = Number(dados.ano);
  if (vazio(dados.ano) || !Number.isInteger(ano) || ano < 1 || ano > anoAtual) {
    throw new Error(`O ano deve ser um número inteiro entre 1 e ${anoAtual}.`);
  }

  const tecnica = String(dados.tecnica ?? '').trim();
  if (!tecnica) throw new Error('Informe a técnica.');

  const descricao = String(dados.descricao ?? '').trim();
  if (descricao.length < 20 || descricao.length > 2000) {
    throw new Error('A descrição deve ter de 20 a 2000 caracteres.');
  }

  const imagem_url = String(dados.imagem_url ?? '').trim();
  if (!imagem_url.startsWith('/') && !imagem_url.startsWith('https://')) {
    throw new Error('Informe o endereço da imagem, começando com / ou https://.');
  }

  const dimensoes = String(dados.dimensoes ?? '').trim();

  const em_exibicao = dados.em_exibicao;
  if (typeof em_exibicao !== 'boolean') throw new Error('Informe se a obra está em exibição.');

  return {
    titulo,
    artista_id,
    categoria_id,
    ano,
    tecnica,
    dimensoes,
    descricao,
    imagem_url,
    em_exibicao,
  };
}

export function criarObra(dados) {
  exigirAdminApi();
  const campos = validarObra(dados);
  const criadas = ler('obras_criadas', []);
  const maiorId = [
    ...obrasArquivo,
    ...criadas,
    ...ler('obras_excluidas', []).map((id) => ({ id })),
  ].reduce((maior, o) => Math.max(maior, o.id), 0);
  const obra = { id: Math.max(1000, maiorId + 1), ...campos, criado_em: textoData(hoje()) };
  gravar('obras_criadas', [...criadas, obra]);
  return comNomes(obra);
}

export function editarObra(id, dados) {
  exigirAdminApi();
  const idObra = Number(id);
  const campos = validarObra(dados);

  const criadas = ler('obras_criadas', []);
  const indiceCriada = criadas.findIndex((o) => o.id === idObra);
  if (indiceCriada !== -1) {
    criadas[indiceCriada] = { ...criadas[indiceCriada], ...campos };
    gravar('obras_criadas', criadas);
    return comNomes(criadas[indiceCriada]);
  }

  const original = obrasArquivo.find((o) => o.id === idObra);
  if (!original || ler('obras_excluidas', []).includes(idObra))
    throw new Error('Obra não encontrada.');
  const editadas = ler('obras_editadas', {});
  editadas[idObra] = { ...original, ...campos };
  gravar('obras_editadas', editadas);
  return comNomes(editadas[idObra]);
}

export function excluirObra(id) {
  exigirAdminApi();
  const idObra = Number(id);

  const criadas = ler('obras_criadas', []);
  if (criadas.some((o) => o.id === idObra)) {
    gravar(
      'obras_criadas',
      criadas.filter((o) => o.id !== idObra),
    );
  } else {
    const excluidas = ler('obras_excluidas', []);
    if (!obrasArquivo.some((o) => o.id === idObra) || excluidas.includes(idObra)) {
      throw new Error('Obra não encontrada.');
    }
    gravar('obras_excluidas', [...excluidas, idObra]);
    const editadas = ler('obras_editadas', {});
    delete editadas[idObra];
    gravar('obras_editadas', editadas);
  }

  gravar(
    'favoritos',
    ler('favoritos', []).filter((f) => f.obra_id !== idObra),
  );
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

// Apaga todas as chaves museu: do localStorage (usuários, sessão, favoritos,
// reservas e alterações do admin). Recarregue a página depois.
export function resetarDados() {
  const chaves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave.startsWith(PREFIXO)) chaves.push(chave);
  }
  chaves.forEach((chave) => localStorage.removeItem(chave));
}
