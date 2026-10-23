// Responsável: M1
// Monta URLs a partir da pasta client/, para os links funcionarem mesmo se o
// Live Server for aberto na raiz do repositório em vez de /client.
//   urlApp('pages/obra.html?id=3') -> http://127.0.0.1:5500/pages/obra.html?id=3
const BASE_APP = new URL('../../', import.meta.url);

export function urlApp(caminho) {
  return new URL(String(caminho).replace(/^\/+/, ''), BASE_APP).href;
}

export function caminhoInicio() {
  return new URL('index.html', BASE_APP).pathname;
}
