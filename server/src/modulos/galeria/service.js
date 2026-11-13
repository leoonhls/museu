// Responsável: M3 — veja a seção "M3" no Guia da Entrega 2
import { buscarComFiltros, POR_PAGINA } from '../../repositorios/busca-obras.repo.js';
import { requisicaoInvalida } from '../../erros.js';

const ORDENS = ['titulo', 'antigas', 'recentes'];
const MAX_BUSCA = 100;

// Tudo em req.query chega como texto (ou lista, se o parâmetro vier repetido: ?a=1&a=2).
// Campo vazio (?categoria=) conta como "não informado": o formulário da galeria manda campos vazios.
const naoInformado = (valor) => valor === undefined || valor === '';

// Inteiro >= 1, ou undefined se não informado. Atenção: Number('') é 0, por isso o vazio é tratado antes.
function inteiroOpcional(valor, mensagem) {
  if (naoInformado(valor)) return undefined;
  if (typeof valor !== 'string') throw requisicaoInvalida(mensagem);
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) throw requisicaoInvalida(mensagem);
  return numero;
}

// Inteiro qualquer (ano), ou undefined se não informado.
function anoOpcional(valor) {
  if (naoInformado(valor)) return undefined;
  if (typeof valor !== 'string') throw requisicaoInvalida('Período inválido.');
  const numero = Number(valor);
  if (!Number.isInteger(numero)) throw requisicaoInvalida('Período inválido.');
  return numero;
}

function lerOrdem(valor) {
  if (naoInformado(valor)) return 'titulo';
  if (!ORDENS.includes(valor)) throw requisicaoInvalida('Ordem inválida.');
  return valor;
}

function lerBusca(valor) {
  if (naoInformado(valor)) return undefined;
  if (typeof valor !== 'string') throw requisicaoInvalida('Busca inválida.');
  const texto = valor.trim();
  if (texto.length > MAX_BUSCA) throw requisicaoInvalida('Busca muito longa.');
  return texto || undefined;
}

// Valida e converte os parâmetros vindos da URL. Lança 400 com a mensagem da tabela do guia.
export function validarFiltros(query = {}) {
  const pagina = inteiroOpcional(query.pagina, 'Página inválida.') ?? 1;
  const categoria = inteiroOpcional(query.categoria, 'Categoria inválida.');
  const artista = inteiroOpcional(query.artista, 'Artista inválido.');
  const anoMin = anoOpcional(query.anoMin);
  const anoMax = anoOpcional(query.anoMax);
  if (anoMin !== undefined && anoMax !== undefined && anoMin > anoMax) {
    throw requisicaoInvalida('Período inválido.');
  }
  const ordem = lerOrdem(query.ordem);
  const busca = lerBusca(query.busca);
  return { busca, categoria, artista, anoMin, anoMax, ordem, pagina };
}

export async function listarObras(query) {
  const filtros = validarFiltros(query);
  const { dados, total } = await buscarComFiltros(filtros);
  return { dados, total, pagina: filtros.pagina, porPagina: POR_PAGINA };
}
