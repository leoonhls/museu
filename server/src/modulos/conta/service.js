// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import bcrypt from 'bcryptjs';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as categoriasRepo from '../../repositorios/categorias.repo.js';
import * as favoritosRepo from '../../repositorios/favoritos.repo.js';
import * as historicoRepo from '../../repositorios/historico-conta.repo.js';
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as usuariosRepo from '../../repositorios/usuarios.repo.js';
import {
  conflito,
  naoAutenticado,
  naoEncontrado,
  requisicaoInvalida,
} from '../../erros.js';

const PERFIL_PADRAO = {
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

function perfilNormalizado(perfil = {}) {
  return {
    ...PERFIL_PADRAO,
    ...perfil,
    acessibilidade: { ...PERFIL_PADRAO.acessibilidade, ...perfil.acessibilidade },
  };
}

function semSenha(usuario) {
  const { senha_hash, ...resto } = usuario;
  return { ...resto, perfil: perfilNormalizado(resto.perfil) };
}

async function registrarHistorico(usuarioId, tipo, descricao) {
  await historicoRepo.registrar(usuarioId, tipo, descricao);
}

// Usuário da sessão sem senha_hash, ou null.
export async function usuarioAtual(usuarioId) {
  if (!usuarioId) return null;
  const usuario = await usuariosRepo.buscarPorId(usuarioId);
  return usuario ? semSenha(usuario) : null;
}

export async function cadastrar(dados = {}) {
  const nome = String(dados?.nome ?? '').trim();
  const email = String(dados?.email ?? '').trim().toLowerCase();
  const senha = String(dados?.senha ?? '');

  if (nome.length < 3) {
    throw requisicaoInvalida('O nome deve ter pelo menos 3 caracteres.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw requisicaoInvalida('Informe um e-mail válido.');
  }
  if (senha.length < 8 || !/[a-zA-Z]/.test(senha) || !/\d/.test(senha)) {
    throw requisicaoInvalida('A senha deve ter pelo menos 8 caracteres, com letras e números.');
  }

  if (await usuariosRepo.buscarPorEmail(email)) {
    throw conflito('Este e-mail já está cadastrado.');
  }

  const usuario = await usuariosRepo.criar({
    nome,
    email,
    senha_hash: await bcrypt.hash(senha, 10),
    papel: 'visitante',
    perfil: perfilNormalizado(),
  });
  await registrarHistorico(usuario.id, 'cadastro', 'Conta criada.');
  return semSenha(usuario);
}

export async function entrar(dados = {}) {
  const email = String(dados?.email ?? '').trim().toLowerCase();
  const senha = String(dados?.senha ?? '');
  const usuario = await usuariosRepo.buscarPorEmail(email);

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    throw naoAutenticado('E-mail ou senha incorretos.');
  }

  await registrarHistorico(usuario.id, 'login', 'Entrada na conta.');
  return semSenha(usuario);
}

export async function sair(sessao) {
  if (sessao.usuarioId) {
    await registrarHistorico(sessao.usuarioId, 'logout', 'Saída da conta.');
  }
  await new Promise((resolve, reject) => {
    sessao.destroy((erro) => (erro ? reject(erro) : resolve()));
  });
}

export async function obterPerfil(usuarioId) {
  const usuario = await usuariosRepo.buscarPorId(usuarioId);
  if (!usuario) throw naoEncontrado('Conta não encontrada.');
  return perfilNormalizado(usuario.perfil);
}

export async function atualizarPerfil(usuarioId, dados = {}) {
  const atual = await obterPerfil(usuarioId);
  const biografia = String(dados?.biografia ?? '').trim();
  const interesses = String(dados?.interesses ?? '').trim();
  const telefone = String(dados?.telefone ?? '').trim();
  const site = String(dados?.site ?? '').trim();
  const idioma = String(dados?.idioma ?? atual.idioma);
  const idiomasPermitidos = ['pt-BR', 'en', 'es'];

  if (biografia.length > 500) throw requisicaoInvalida('A biografia deve ter no máximo 500 caracteres.');
  if (interesses.length > 500) throw requisicaoInvalida('Os interesses devem ter no máximo 500 caracteres.');
  if (telefone.length > 30) throw requisicaoInvalida('O telefone deve ter no máximo 30 caracteres.');
  if (site.length > 200) throw requisicaoInvalida('O endereço do site deve ter no máximo 200 caracteres.');
  if (site) {
    let url;
    try {
      url = new URL(site);
    } catch {
      throw requisicaoInvalida('Informe um endereço de site válido, começando com https://.');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw requisicaoInvalida('O endereço do site deve começar com http:// ou https://.');
    }
  }
  if (!idiomasPermitidos.includes(idioma)) {
    throw requisicaoInvalida('Selecione um idioma válido.');
  }

  const avatar = dados?.avatar === undefined ? atual.avatar : String(dados.avatar);
  if (
    avatar &&
    (avatar.length > 300_000 ||
      !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar))
  ) {
    throw requisicaoInvalida('A foto deve ser PNG, JPEG ou WebP e ter no máximo 200 KB.');
  }

  const perfil = {
    avatar,
    biografia,
    interesses,
    telefone,
    site,
    idioma,
    newsletter: dados?.newsletter === true,
    acessibilidade: {
      altoContraste: dados?.altoContraste === true,
      reduzirAnimacoes: dados?.reduzirAnimacoes === true,
    },
  };
  const usuario = await usuariosRepo.atualizarPerfil(usuarioId, perfil);
  if (!usuario) throw naoEncontrado('Conta não encontrada.');
  await registrarHistorico(usuarioId, 'perfil', 'Perfil atualizado.');
  return perfil;
}

export async function listarHistorico(usuarioId) {
  return historicoRepo.listarPorUsuario(usuarioId);
}

export async function listarFavoritos(usuarioId) {
  const [favoritos, obras, artistas, categorias] = await Promise.all([
    favoritosRepo.listarPorUsuario(usuarioId),
    obrasRepo.listarTodas(),
    artistasRepo.listarTodos(),
    categoriasRepo.listarTodas(),
  ]);
  const obrasPorId = new Map(obras.map((obra) => [obra.id, obra]));
  const artistasPorId = new Map(artistas.map((artista) => [artista.id, artista]));
  const categoriasPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]));

  return favoritos.flatMap(({ obra_id }) => {
    const obra = obrasPorId.get(obra_id);
    if (!obra) return [];
    return [{
      ...obra,
      artista_nome: artistasPorId.get(obra.artista_id)?.nome ?? null,
      categoria_nome: categoriasPorId.get(obra.categoria_id)?.nome ?? null,
    }];
  });
}

export async function favoritar(usuarioId, obraId) {
  const obra = await obrasRepo.buscarPorId(obraId);
  if (!obra) throw naoEncontrado('Obra não encontrada.');
  const favorito = await favoritosRepo.adicionar(usuarioId, obra.id);
  if (favorito.criado) {
    await registrarHistorico(usuarioId, 'favorito', `Obra adicionada aos favoritos: ${obra.titulo}.`);
  }
}

export async function desfavoritar(usuarioId, obraId) {
  const removido = await favoritosRepo.remover(usuarioId, obraId);
  if (removido) {
    const obra = await obrasRepo.buscarPorId(obraId);
    if (obra) {
      await registrarHistorico(usuarioId, 'favorito', `Obra removida dos favoritos: ${obra.titulo}.`);
    }
  }
}
