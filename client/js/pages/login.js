import { entrar, redefinirSenha } from '../api.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { caminhoInicio, urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const painelLogin = document.getElementById('painelLogin');
const painelRecuperacao = document.getElementById('painelRecuperacao');
const paineisConta = document.getElementById('paineisConta');
const formLogin = document.getElementById('formLogin');
const formRecuperacao = document.getElementById('formRecuperacao');
const mensagemLogin = document.getElementById('mensagemLogin');
const mensagemRecuperacao = document.getElementById('mensagemRecuperacao');

function mostrarRecuperacao() {
  painelLogin.hidden = true;
  painelRecuperacao.hidden = false;
  paineisConta.classList.add('login--recuperacao');
  mensagemLogin.textContent = '';
  mensagemRecuperacao.textContent = '';
}

function voltarAosPaineisConta() {
  painelLogin.hidden = false;
  painelRecuperacao.hidden = true;
  paineisConta.classList.remove('login--recuperacao');
  mensagemLogin.textContent = '';
  mensagemRecuperacao.textContent = '';
}

function mostrarErro(elemento, erro) {
  elemento.className = 'mensagem mensagem--erro';
  elemento.textContent = erro.message;
}

function validarFormularioLogin() {
  const campoInvalido = [...formLogin.elements].find(
    (campo) => campo.willValidate && !campo.validity.valid,
  );
  if (!campoInvalido) return true;

  const mensagem = campoInvalido.validity.valueMissing
    ? campoInvalido.name === 'senha'
      ? 'Informe sua senha.'
      : 'Informe seu e-mail.'
    : campoInvalido.validity.typeMismatch
      ? 'Informe um e-mail válido, como nome@exemplo.com.'
      : 'Confira os dados informados.';
  mostrarErro(mensagemLogin, { message: mensagem });
  campoInvalido.focus();
  return false;
}

function validarFormularioRecuperacao() {
  const campoInvalido = [...formRecuperacao.elements].find(
    (campo) => campo.willValidate && !campo.validity.valid,
  );
  if (!campoInvalido) return true;

  const mensagem = campoInvalido.validity.valueMissing
    ? 'Preencha este campo.'
    : campoInvalido.validity.typeMismatch
      ? 'Informe um e-mail válido, como nome@exemplo.com.'
      : 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.';
  mostrarErro(mensagemRecuperacao, { message: mensagem });
  campoInvalido.focus();
  return false;
}

function destinoAposLogin() {
  const destino = new URLSearchParams(location.search).get('voltar');
  if (!destino || !destino.startsWith('/') || destino.startsWith('//')) return caminhoInicio();

  const url = new URL(destino, location.origin);
  const inicioApp = new URL(urlApp('index.html'));
  const caminhoApp = inicioApp.pathname.slice(0, inicioApp.pathname.lastIndexOf('/') + 1);
  return url.origin === location.origin && url.pathname.startsWith(caminhoApp)
    ? `${url.pathname}${url.search}${url.hash}`
    : caminhoInicio();
}

document.getElementById('mostrarRecuperacao').addEventListener('click', () => {
  mostrarRecuperacao();
});

document.getElementById('voltarLogin').addEventListener('click', () => {
  voltarAosPaineisConta();
});

document.querySelectorAll('[data-alvo-senha]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const campo = document.getElementById(botao.dataset.alvoSenha);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    botao.setAttribute('aria-pressed', String(mostrar));
  });
});

formLogin.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validarFormularioLogin()) return;

  const dados = new FormData(formLogin);

  try {
    entrar(dados.get('email'), dados.get('senha'));
    location.href = destinoAposLogin();
  } catch (erro) {
    mostrarErro(mensagemLogin, {
      message:
        erro.message === 'E-mail ou senha incorretos.'
          ? 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
          : erro.message,
    });
  }
});

formLogin.addEventListener('input', () => {
  mensagemLogin.textContent = '';
  mensagemLogin.className = 'mensagem';
});

formRecuperacao.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validarFormularioRecuperacao()) return;

  const dados = new FormData(formRecuperacao);
  try {
    redefinirSenha(dados.get('email'), dados.get('senha'));
    voltarAosPaineisConta();
    mensagemLogin.className = 'mensagem mensagem--sucesso';
    mensagemLogin.textContent = 'Senha atualizada. Entre com sua nova senha.';
  } catch (erro) {
    mostrarErro(mensagemRecuperacao, erro);
  }
});

formRecuperacao.addEventListener('input', () => {
  mensagemRecuperacao.textContent = '';
  mensagemRecuperacao.className = 'mensagem';
});
