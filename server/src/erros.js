// Responsável: M1
export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export const requisicaoInvalida = (msg) => new ErroApi(400, msg);
export const naoAutenticado = (msg = 'Faça login para continuar.') => new ErroApi(401, msg);
export const proibido = (msg = 'Acesso restrito ao administrador.') => new ErroApi(403, msg);
export const naoEncontrado = (msg = 'Não encontrado.') => new ErroApi(404, msg);
export const conflito = (msg) => new ErroApi(409, msg);
export const naoImplementado = (responsavel) =>
  new ErroApi(501, `Rota ainda não implementada (responsável: ${responsavel}).`);
