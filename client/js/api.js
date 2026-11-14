// Responsável: M1 — único ponto de acesso a dados (Entrega 2: servidor)
//
// Mesmas funções e mesmos retornos da Entrega 1, agora assíncronas: use await.
// Em caso de problema, lançam um Error com a mensagem do servidor, pronta para o
// usuário, e erro.status com o status HTTP (401, 404...):
//   try { await criarReserva(dados); } catch (erro) { mostrarToast(erro.message, 'erro'); }

async function requisicao(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: {} };
  if (corpo instanceof FormData) {
    opcoes.body = corpo;
  } else if (corpo !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, opcoes);
  } catch {
    throw new Error('Sem conexão com o servidor. Tente de novo.');
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const erro = new Error(dados?.erro || 'Erro inesperado no servidor.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

// Monta a query string ignorando filtros vazios.
function query(filtros = {}) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null && valor !== undefined) params.set(chave, valor);
  }
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

// 404 vira null, como os buscar* da Entrega 1.
async function ouNull(promessa) {
  try {
    return await promessa;
  } catch (erro) {
    if (erro.status === 404) return null;
    throw erro;
  }
}

const id = (valor) => encodeURIComponent(valor);

// ---------------------------------------------------------------------------
// Acervo, galeria e destaques
// ---------------------------------------------------------------------------

export function listarObras(filtros) {
  return requisicao('GET', `/obras${query(filtros)}`);
}

export function buscarObra(obraId) {
  return ouNull(requisicao('GET', `/obras/${id(obraId)}`));
}

export function listarArtistas() {
  return requisicao('GET', '/artistas');
}

export function buscarArtista(artistaId) {
  return ouNull(requisicao('GET', `/artistas/${id(artistaId)}`));
}

export function listarCategorias() {
  return requisicao('GET', '/categorias');
}

export function buscarDestaques() {
  return requisicao('GET', '/destaques');
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------

export function listarExposicoes(filtros) {
  return requisicao('GET', `/exposicoes${query(filtros)}`);
}

export function buscarExposicao(exposicaoId) {
  return ouNull(requisicao('GET', `/exposicoes/${id(exposicaoId)}`));
}

export function listarEventos(filtros) {
  return requisicao('GET', `/eventos${query(filtros)}`);
}

// ---------------------------------------------------------------------------
// Conta e favoritos
// ---------------------------------------------------------------------------

export function cadastrar(dados) {
  return requisicao('POST', '/auth/cadastro', dados);
}

export function entrar(email, senha) {
  return requisicao('POST', '/auth/login', { email, senha });
}

export function sair() {
  return requisicao('POST', '/auth/logout');
}

export function usuarioAtual() {
  return requisicao('GET', '/auth/me');
}

export function obterPerfilUsuario() {
  return requisicao('GET', '/auth/perfil');
}

export function atualizarPerfil(dados) {
  return requisicao('PUT', '/auth/perfil', dados);
}

export function listarHistoricoConta() {
  return requisicao('GET', '/auth/historico');
}

export function listarFavoritos() {
  return requisicao('GET', '/favoritos');
}

export function favoritar(obraId) {
  return requisicao('POST', `/favoritos/${id(obraId)}`);
}

export function desfavoritar(obraId) {
  return requisicao('DELETE', `/favoritos/${id(obraId)}`);
}

export function aplicarPreferenciasAcessibilidade(perfil = {}) {
  const acessibilidade = perfil.acessibilidade ?? {};
  document.documentElement.dataset.altoContraste = String(Boolean(acessibilidade.altoContraste));
  document.documentElement.dataset.reduzirAnimacoes = String(Boolean(acessibilidade.reduzirAnimacoes));
}

// ---------------------------------------------------------------------------
// Reservas
// ---------------------------------------------------------------------------

export function criarReserva(dados) {
  return requisicao('POST', '/reservas', dados);
}

export function minhasReservas() {
  return requisicao('GET', '/reservas/minhas');
}

export function cancelarReserva(reservaId) {
  return requisicao('DELETE', `/reservas/${id(reservaId)}`);
}

// ---------------------------------------------------------------------------
// Administração
// ---------------------------------------------------------------------------

export function criarObra(dados) {
  return requisicao('POST', '/obras', dados);
}

export function editarObra(obraId, dados) {
  return requisicao('PUT', `/obras/${id(obraId)}`, dados);
}

export function excluirObra(obraId) {
  return requisicao('DELETE', `/obras/${id(obraId)}`);
}

// Envia a imagem (campo "imagem") e devolve a url dela no site.
export async function enviarImagem(arquivo) {
  const formulario = new FormData();
  formulario.append('imagem', arquivo);
  const { url } = await requisicao('POST', '/uploads', formulario);
  return url;
}
