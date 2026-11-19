// Responsável: M1
import { ErroApi } from '../erros.js';

// Erros do PostgreSQL (err.code) que escaparam dos services. A mensagem original do banco
// não vai para o cliente: ela pode mostrar nomes de tabelas e colunas.
const ERROS_BANCO = {
  23505: [409, 'Registro duplicado.'],
  23503: [400, 'Referência inválida.'],
  23502: [400, 'Dados inválidos.'],
  23514: [400, 'Dados inválidos.'],
  '22P02': [400, 'Valor em formato inválido.'],
  22007: [400, 'Valor em formato inválido.'],
  22008: [400, 'Valor em formato inválido.'],
};

// Qualquer /api/* que nenhuma rota atendeu.
export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// O Express reconhece o middleware de erro pelos 4 parâmetros, mesmo sem usar o next.
export function tratarErros(err, req, res, next) {
  if (err instanceof ErroApi) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição grande demais.' });
  }
  // Demais erros do leitor de corpo (JSON malformado, charset ou compressão não suportados).
  if (err.type && err.expose && err.status >= 400 && err.status < 500) {
    return res.status(400).json({ erro: 'Corpo da requisição inválido.' });
  }
  console.error(err);
  const erroBanco = ERROS_BANCO[err.code];
  if (erroBanco) {
    const [status, mensagem] = erroBanco;
    return res.status(status).json({ erro: mensagem });
  }
  res.status(500).json({ erro: 'Erro interno no servidor.' });
}
