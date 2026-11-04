// Responsável: M1
import { ErroApi } from '../erros.js';

const MENSAGENS_MULTER = {
  LIMIT_FILE_SIZE: 'Arquivo grande demais.',
  LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado.',
  LIMIT_FILE_COUNT: 'Arquivos demais no envio.',
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
  if (err.name === 'MulterError') {
    return res.status(400).json({ erro: MENSAGENS_MULTER[err.code] ?? 'Erro no envio do arquivo.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição grande demais.' });
  }
  // Demais erros do leitor de corpo (JSON malformado, charset ou compressão não suportados).
  if (err.type && err.expose && err.status >= 400 && err.status < 500) {
    return res.status(400).json({ erro: 'Corpo da requisição inválido.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
}
