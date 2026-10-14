// client/js/api.js — Entrega 1
//
// ÚNICO ponto de acesso a dados do front. Nenhuma página ou componente pode
// ler JSON, chamar fetch para dados ou mexer no localStorage diretamente.
//
// Todas as funções são async e devolvem exatamente o formato que a API
// devolverá na Entrega 2. Na E2 só o corpo delas muda (passa a usar fetch).
//
// Erros: toda falha lança ErroApi { status, message }, espelhando a resposta
// { "erro": "mensagem" } com o status HTTP (400, 401, 403, 404, 409).

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

const POR_PAGINA = 12;
const PRECO_VISITA_INTEIRA = 30;

// ---------------------------------------------------------------------------
// Infraestrutura (só existe na Entrega 1)
// ---------------------------------------------------------------------------

const cacheJson = new Map();

async function carregar(nome) {
  if (!cacheJson.has(nome)) {
    cacheJson.set(nome, fetch(`/data/${nome}.json`).then((resp) => {
      if (!resp.ok) throw new ErroApi(500, `Não foi possível carregar ${nome}.json`);
      return resp.json();
    }));
  }
  // Cópia profunda, para quem chama não alterar o cache.
  return structuredClone(await cacheJson.get(nome));
}

const PREFIXO = 'museu:';

function lerLocal(chave, padrao = []) {
  const valor = localStorage.getItem(PREFIXO + chave);
  return valor === null ? padrao : JSON.parse(valor);
}

function gravarLocal(chave, valor) {
  localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
}

function proximoId(lista, minimo = 1) {
  return Math.max(minimo - 1, 0, ...lista.map((item) => item.id)) + 1;
}

const agora = () => new Date().toISOString();
// Data local (não UTC), no formato 'AAAA-MM-DD'.
const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function paginar(lista, pagina) {
  const p = Math.max(1, Number(pagina) || 1);
  return {
    dados: lista.slice((p - 1) * POR_PAGINA, p * POR_PAGINA),
    total: lista.length,
    pagina: p,
    porPagina: POR_PAGINA,
  };
}

const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Senha "hasheada" só para não ficar em texto puro no localStorage.
// NÃO é seguro: login da E1 é simulado e será trocado por bcrypt na E2.
async function hashSenha(senha) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(senha);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `texto:${senha}`; // contexto não seguro (ex.: IP da rede no Live Server)
}

// ---------------------------------------------------------------------------
// Obras (JSON + alterações do admin guardadas no localStorage)
// ---------------------------------------------------------------------------

// obras_admin: obras criadas ou editadas pelo admin (substituem as do JSON pelo id)
// obras_excluidas: ids de obras do JSON excluídas pelo admin
async function todasObras() {
  const excluidas = new Set(lerLocal('obras_excluidas'));
  const alteradas = new Map(lerLocal('obras_admin').map((o) => [o.id, o]));
  const base = (await carregar('obras'))
    .filter((o) => !excluidas.has(o.id))
    .map((o) => alteradas.get(o.id) ?? o);
  const idsBase = new Set(base.map((o) => o.id));
  const novas = [...alteradas.values()].filter((o) => !idsBase.has(o.id) && !excluidas.has(o.id));
  return [...base, ...novas];
}

async function comArtista(obras) {
  const artistas = new Map((await carregar('artistas')).map((a) => [a.id, a]));
  return obras.map((o) => ({ ...o, artista_nome: artistas.get(o.artista_id)?.nome ?? null }));
}

const ORDENS = {
  titulo: (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'),
  '-titulo': (a, b) => b.titulo.localeCompare(a.titulo, 'pt-BR'),
  ano: (a, b) => a.ano - b.ano,
  '-ano': (a, b) => b.ano - a.ano,
  recentes: (a, b) => String(b.criado_em).localeCompare(String(a.criado_em)),
};

export async function listarObras({ busca, categoria, artista, anoMin, anoMax, ordem = 'titulo', pagina = 1 } = {}) {
  if (anoMin && anoMax && Number(anoMin) > Number(anoMax)) {
    throw new ErroApi(400, 'anoMin não pode ser maior que anoMax');
  }
  if (ordem && !ORDENS[ordem]) throw new ErroApi(400, `Ordem inválida: ${ordem}`);

  let dados = await comArtista(await todasObras());
  if (busca) {
    const termo = normalizar(busca);
    dados = dados.filter((o) => normalizar(o.titulo).includes(termo) || normalizar(o.artista_nome).includes(termo));
  }
  if (categoria) dados = dados.filter((o) => o.categoria_id === Number(categoria));
  if (artista) dados = dados.filter((o) => o.artista_id === Number(artista));
  if (anoMin) dados = dados.filter((o) => o.ano >= Number(anoMin));
  if (anoMax) dados = dados.filter((o) => o.ano <= Number(anoMax));
  dados.sort(ORDENS[ordem]);
  return paginar(dados, pagina);
}

// Devolve a obra com artista, categoria e exposições já juntados.
export async function buscarObra(id) {
  const obra = (await todasObras()).find((o) => o.id === Number(id));
  if (!obra) throw new ErroApi(404, 'Obra não encontrada');
  const [artistas, categorias, exposicoes] = await Promise.all([
    carregar('artistas'), carregar('categorias'), carregar('exposicoes'),
  ]);
  return {
    ...obra,
    artista: artistas.find((a) => a.id === obra.artista_id) ?? null,
    categoria: categorias.find((c) => c.id === obra.categoria_id) ?? null,
    exposicoes: exposicoes
      .filter((e) => e.obra_ids.includes(obra.id))
      .map(({ obra_ids, ...e }) => ({ ...e, status: statusExposicao(e) })),
  };
}

// ---------------------------------------------------------------------------
// Artistas e categorias
// ---------------------------------------------------------------------------

export async function listarArtistas() {
  return (await carregar('artistas')).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

// Devolve o artista com a lista das suas obras.
export async function buscarArtista(id) {
  const artista = (await carregar('artistas')).find((a) => a.id === Number(id));
  if (!artista) throw new ErroApi(404, 'Artista não encontrado');
  const obras = (await todasObras())
    .filter((o) => o.artista_id === artista.id)
    .sort(ORDENS.ano);
  return { ...artista, obras };
}

export async function listarCategorias() {
  return (await carregar('categorias')).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

// ---------------------------------------------------------------------------
// Exposições e eventos
// ---------------------------------------------------------------------------

function statusExposicao({ data_inicio, data_fim }) {
  const d = hoje();
  if (d < data_inicio) return 'futura';
  if (d > data_fim) return 'passada';
  return 'atual';
}

// status: 'atual' | 'futura' | 'passada' (opcional)
export async function listarExposicoes({ status } = {}) {
  if (status && !['atual', 'futura', 'passada'].includes(status)) {
    throw new ErroApi(400, `Status inválido: ${status}`);
  }
  return (await carregar('exposicoes'))
    .map(({ obra_ids, ...e }) => ({ ...e, status: statusExposicao(e) }))
    .filter((e) => !status || e.status === status)
    .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));
}

// Devolve a exposição com as obras dela.
export async function buscarExposicao(id) {
  const expo = (await carregar('exposicoes')).find((e) => e.id === Number(id));
  if (!expo) throw new ErroApi(404, 'Exposição não encontrada');
  const ids = new Set(expo.obra_ids);
  const obras = await comArtista((await todasObras()).filter((o) => ids.has(o.id)));
  const { obra_ids, ...dados } = expo;
  return { ...dados, status: statusExposicao(expo), obras };
}

function ocupacaoEvento(eventoId, reservas) {
  return reservas
    .filter((r) => r.evento_id === eventoId && r.status === 'confirmada')
    .reduce((soma, r) => soma + r.qtd_inteira + r.qtd_meia, 0);
}

// de, ate: 'AAAA-MM-DD' (opcionais, inclusivos). Cada evento vem com vagas_restantes.
export async function listarEventos({ de, ate } = {}) {
  const reservas = lerLocal('reservas');
  return (await carregar('eventos'))
    .filter((e) => (!de || e.data_hora.slice(0, 10) >= de) && (!ate || e.data_hora.slice(0, 10) <= ate))
    .map((e) => ({ ...e, vagas_restantes: Math.max(0, e.capacidade - ocupacaoEvento(e.id, reservas)) }))
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora));
}

// ---------------------------------------------------------------------------
// Autenticação (simulada na E1)
// ---------------------------------------------------------------------------

const ADMIN_SEMEADO = { nome: 'Administrador', email: 'admin@museu.com', senha: 'admin123' };

async function usuarios() {
  let lista = lerLocal('usuarios');
  if (!lista.some((u) => u.email === ADMIN_SEMEADO.email)) {
    lista = [...lista, {
      id: proximoId(lista),
      nome: ADMIN_SEMEADO.nome,
      email: ADMIN_SEMEADO.email,
      senha_hash: await hashSenha(ADMIN_SEMEADO.senha),
      papel: 'admin',
      criado_em: agora(),
    }];
    gravarLocal('usuarios', lista);
  }
  return lista;
}

const semSenha = ({ senha_hash, ...usuario }) => usuario;

async function usuarioLogadoOuErro() {
  const usuario = await usuarioAtual();
  if (!usuario) throw new ErroApi(401, 'Faça login para continuar');
  return usuario;
}

async function adminOuErro() {
  const usuario = await usuarioLogadoOuErro();
  if (usuario.papel !== 'admin') throw new ErroApi(403, 'Acesso restrito a administradores');
  return usuario;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// dados: { nome, email, senha }. Já entra logado após o cadastro.
export async function cadastrar({ nome, email, senha } = {}) {
  nome = String(nome ?? '').trim();
  email = String(email ?? '').trim().toLowerCase();
  if (!nome) throw new ErroApi(400, 'Informe o nome');
  if (!EMAIL_VALIDO.test(email)) throw new ErroApi(400, 'E-mail inválido');
  if (!senha || senha.length < 6) throw new ErroApi(400, 'A senha deve ter pelo menos 6 caracteres');

  const lista = await usuarios();
  if (lista.some((u) => u.email === email)) throw new ErroApi(409, 'E-mail já cadastrado');
  const usuario = {
    id: proximoId(lista), nome, email,
    senha_hash: await hashSenha(senha),
    papel: 'visitante',
    criado_em: agora(),
  };
  gravarLocal('usuarios', [...lista, usuario]);
  gravarLocal('sessao', { usuario_id: usuario.id });
  return semSenha(usuario);
}

export async function entrar(email, senha) {
  email = String(email ?? '').trim().toLowerCase();
  const usuario = (await usuarios()).find((u) => u.email === email);
  if (!usuario || usuario.senha_hash !== await hashSenha(String(senha ?? ''))) {
    throw new ErroApi(401, 'E-mail ou senha incorretos');
  }
  gravarLocal('sessao', { usuario_id: usuario.id });
  return semSenha(usuario);
}

export async function sair() {
  localStorage.removeItem(PREFIXO + 'sessao');
  return { ok: true };
}

// Devolve o usuário logado (sem senha) ou null.
export async function usuarioAtual() {
  const sessao = lerLocal('sessao', null);
  if (!sessao) return null;
  const usuario = (await usuarios()).find((u) => u.id === sessao.usuario_id);
  return usuario ? semSenha(usuario) : null;
}

// ---------------------------------------------------------------------------
// Favoritos
// ---------------------------------------------------------------------------

// Devolve as obras favoritas do usuário logado (mais recentes primeiro).
export async function listarFavoritos() {
  const usuario = await usuarioLogadoOuErro();
  const meus = lerLocal('favoritos')
    .filter((f) => f.usuario_id === usuario.id)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  const obras = new Map((await comArtista(await todasObras())).map((o) => [o.id, o]));
  return meus
    .filter((f) => obras.has(f.obra_id))
    .map((f) => ({ ...obras.get(f.obra_id), favoritado_em: f.criado_em }));
}

export async function favoritar(obraId) {
  const usuario = await usuarioLogadoOuErro();
  obraId = Number(obraId);
  if (!(await todasObras()).some((o) => o.id === obraId)) throw new ErroApi(404, 'Obra não encontrada');
  const lista = lerLocal('favoritos');
  if (!lista.some((f) => f.usuario_id === usuario.id && f.obra_id === obraId)) {
    gravarLocal('favoritos', [...lista, { usuario_id: usuario.id, obra_id: obraId, criado_em: agora() }]);
  }
  return { usuario_id: usuario.id, obra_id: obraId };
}

export async function desfavoritar(obraId) {
  const usuario = await usuarioLogadoOuErro();
  obraId = Number(obraId);
  gravarLocal('favoritos', lerLocal('favoritos')
    .filter((f) => !(f.usuario_id === usuario.id && f.obra_id === obraId)));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Reservas
// ---------------------------------------------------------------------------

function gerarCodigo(existentes) {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo;
  do {
    codigo = 'MUS-' + Array.from({ length: 6 }, () => letras[Math.floor(Math.random() * letras.length)]).join('');
  } while (existentes.has(codigo));
  return codigo;
}

// dados: { evento_id (opcional; ausente = visita comum), data_visita ('AAAA-MM-DD',
// obrigatória só na visita comum), qtd_inteira, qtd_meia }.
// O preço é sempre calculado aqui, nunca vem da página.
export async function criarReserva({ evento_id = null, data_visita, qtd_inteira = 0, qtd_meia = 0 } = {}) {
  const usuario = await usuarioLogadoOuErro();
  qtd_inteira = Number(qtd_inteira);
  qtd_meia = Number(qtd_meia);
  if (![qtd_inteira, qtd_meia].every((q) => Number.isInteger(q) && q >= 0)) {
    throw new ErroApi(400, 'Quantidades inválidas');
  }
  const quantidade = qtd_inteira + qtd_meia;
  if (quantidade < 1) throw new ErroApi(400, 'Escolha pelo menos um ingresso');
  if (quantidade > 10) throw new ErroApi(400, 'Máximo de 10 ingressos por reserva');

  const reservas = lerLocal('reservas');
  let precoInteira = PRECO_VISITA_INTEIRA;

  if (evento_id !== null && evento_id !== undefined && evento_id !== '') {
    evento_id = Number(evento_id);
    const evento = (await carregar('eventos')).find((e) => e.id === evento_id);
    if (!evento) throw new ErroApi(404, 'Evento não encontrado');
    data_visita = evento.data_hora.slice(0, 10);
    if (new Date(evento.data_hora) < new Date()) throw new ErroApi(400, 'Este evento já aconteceu');
    const vagas = evento.capacidade - ocupacaoEvento(evento_id, reservas);
    if (quantidade > vagas) {
      throw new ErroApi(409, vagas > 0 ? `Restam apenas ${vagas} vagas` : 'Evento lotado');
    }
    precoInteira = Number(evento.preco);
  } else {
    evento_id = null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data_visita ?? ''))) throw new ErroApi(400, 'Data da visita inválida');
    if (data_visita < hoje()) throw new ErroApi(400, 'Não é possível reservar para uma data passada');
  }

  const reserva = {
    id: proximoId(reservas),
    codigo: gerarCodigo(new Set(reservas.map((r) => r.codigo))),
    usuario_id: usuario.id,
    evento_id,
    data_visita,
    qtd_inteira,
    qtd_meia,
    valor_total: Math.round((qtd_inteira * precoInteira + qtd_meia * precoInteira / 2) * 100) / 100,
    status: 'confirmada',
    criado_em: agora(),
  };
  gravarLocal('reservas', [...reservas, reserva]);
  return reserva;
}

// Reservas do usuário logado, com o evento juntado (null = visita comum).
export async function minhasReservas() {
  const usuario = await usuarioLogadoOuErro();
  const eventos = new Map((await carregar('eventos')).map((e) => [e.id, e]));
  return lerLocal('reservas')
    .filter((r) => r.usuario_id === usuario.id)
    .map((r) => ({ ...r, evento: r.evento_id ? eventos.get(r.evento_id) ?? null : null }))
    .sort((a, b) => b.data_visita.localeCompare(a.data_visita));
}

// Só o dono pode cancelar, e só reservas futuras.
export async function cancelarReserva(id) {
  const usuario = await usuarioLogadoOuErro();
  const reservas = lerLocal('reservas');
  const reserva = reservas.find((r) => r.id === Number(id));
  if (!reserva) throw new ErroApi(404, 'Reserva não encontrada');
  if (reserva.usuario_id !== usuario.id) throw new ErroApi(403, 'Esta reserva não é sua');
  if (reserva.status === 'cancelada') throw new ErroApi(409, 'Reserva já cancelada');
  if (reserva.data_visita < hoje()) throw new ErroApi(400, 'Não é possível cancelar uma reserva passada');
  reserva.status = 'cancelada';
  gravarLocal('reservas', reservas);
  return reserva;
}

// ---------------------------------------------------------------------------
// Admin: obras e upload
// ---------------------------------------------------------------------------

const CAMPOS_OBRIGATORIOS = ['titulo', 'ano', 'tecnica', 'artista_id', 'categoria_id', 'imagem_url'];

async function validarObra(dados) {
  const faltando = CAMPOS_OBRIGATORIOS.filter((c) => dados[c] === undefined || dados[c] === null || String(dados[c]).trim() === '');
  if (faltando.length) throw new ErroApi(400, `Campos obrigatórios: ${faltando.join(', ')}`);

  const obra = {
    titulo: String(dados.titulo).trim(),
    ano: Number(dados.ano),
    tecnica: String(dados.tecnica).trim(),
    dimensoes: String(dados.dimensoes ?? '').trim(),
    descricao: String(dados.descricao ?? '').trim(),
    imagem_url: String(dados.imagem_url).trim(),
    em_exibicao: Boolean(dados.em_exibicao),
    artista_id: Number(dados.artista_id),
    categoria_id: Number(dados.categoria_id),
  };
  if (!Number.isInteger(obra.ano) || obra.ano <= 0 || obra.ano > new Date().getFullYear()) {
    throw new ErroApi(400, 'Ano inválido');
  }
  if (!(await carregar('artistas')).some((a) => a.id === obra.artista_id)) throw new ErroApi(400, 'Artista inexistente');
  if (!(await carregar('categorias')).some((c) => c.id === obra.categoria_id)) throw new ErroApi(400, 'Categoria inexistente');
  return obra;
}

export async function criarObra(dados = {}) {
  await adminOuErro();
  const obra = await validarObra(dados);
  const base = await carregar('obras');
  const alteradas = lerLocal('obras_admin');
  // Ids novos começam depois do maior id que já existiu, para não reaproveitar ids excluídos.
  const id = proximoId([...base, ...alteradas], Math.max(0, ...lerLocal('obras_excluidas')) + 1);
  const nova = { id, ...obra, criado_em: agora() };
  gravarLocal('obras_admin', [...alteradas, nova]);
  return nova;
}

export async function editarObra(id, dados = {}) {
  await adminOuErro();
  const atual = (await todasObras()).find((o) => o.id === Number(id));
  if (!atual) throw new ErroApi(404, 'Obra não encontrada');
  const editada = { ...atual, ...(await validarObra({ ...atual, ...dados })), id: atual.id };
  gravarLocal('obras_admin', [...lerLocal('obras_admin').filter((o) => o.id !== atual.id), editada]);
  return editada;
}

// Excluir obra remove também os favoritos dela (como o ON DELETE CASCADE da E3).
export async function excluirObra(id) {
  await adminOuErro();
  id = Number(id);
  if (!(await todasObras()).some((o) => o.id === id)) throw new ErroApi(404, 'Obra não encontrada');
  gravarLocal('obras_admin', lerLocal('obras_admin').filter((o) => o.id !== id));
  gravarLocal('obras_excluidas', [...new Set([...lerLocal('obras_excluidas'), id])]);
  gravarLocal('favoritos', lerLocal('favoritos').filter((f) => f.obra_id !== id));
  return { ok: true };
}

const TAMANHO_MAX_IMAGEM = 300 * 1024; // na E1 vai como data URL para o localStorage

// arquivo: File de um <input type="file">. Devolve { url } para usar em imagem_url.
export async function enviarImagem(arquivo) {
  await adminOuErro();
  if (!arquivo || !String(arquivo.type).startsWith('image/')) throw new ErroApi(400, 'Envie um arquivo de imagem');
  if (arquivo.size > TAMANHO_MAX_IMAGEM) {
    throw new ErroApi(400, 'Imagem muito grande (máx. 300 KB nesta versão). Comprima ou use uma URL.');
  }
  const url = await new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new ErroApi(400, 'Não foi possível ler a imagem'));
    leitor.readAsDataURL(arquivo);
  });
  return { url };
}
