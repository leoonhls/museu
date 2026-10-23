const BASE_APP = new URL('../../', import.meta.url);

export function urlApp(caminho) {
  return new URL(String(caminho).replace(/^\/+/, ''), BASE_APP).href;
}

export function caminhoInicio() {
  return new URL('index.html', BASE_APP).pathname;
}
