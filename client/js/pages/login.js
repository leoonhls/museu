// Responsável: M7 — veja a seção "M7 — Login e favoritos" no Guia da Entrega 1
import { entrar, cadastrar } from '../api.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { caminhoInicio, urlApp } from '../utils/rotas.js';

montarHeader();
montarFooter();

const abas = {
  login: { aba: document.getElementById('abaEntrar'), painel: document.getElementById('painelLogin') },
  cadastro: {
    aba: document.getElementById('abaCadastro'),
    painel: document.getElementById('painelCadastro'),
  },
};
const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');
const mensagemLogin = document.getElementById('mensagemLogin');
const mensagemCadastro = document.getElementById('mensagemCadastro');

function mostrarAba(nome) {
  for (const [chave, { aba, painel }] of Object.entries(abas)) {
    const ativa = chave === nome;
    aba.setAttribute('aria-selected', String(ativa));
    painel.hidden = !ativa;
  }
  mensagemLogin.textContent = '';
  mensagemCadastro.textContent = '';
}

function mostrarErro(elemento, mensagem) {
  elemento.className = 'mensagem mensagem--erro';
  elemento.textContent = mensagem;
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
  mostrarErro(mensagemLogin, mensagem);
  campoInvalido.focus();
  return false;
}

function validarFormularioCadastro() {
  const campos = [...formCadastro.elements];
  const campoVazio = campos.find((campo) => campo.willValidate && campo.validity.valueMissing);
  if (campoVazio) {
    mostrarErro(
      mensagemCadastro,
      campoVazio.name === 'confirmarSenha' ? 'Confirme sua senha.' : 'Preencha este campo.',
    );
    campoVazio.focus();
    return false;
  }

  const nome = document.getElementById('nomeCadastro');
  const email = document.getElementById('emailCadastro');
  const senha = document.getElementById('senhaCadastro');
  const confirmacao = document.getElementById('confirmarSenhaCadastro');

  if (nome.validity.tooShort) {
    mostrarErro(mensagemCadastro, 'O nome deve ter pelo menos 3 caracteres.');
    nome.focus();
    return false;
  }
  if (!email.validity.valid) {
    mostrarErro(mensagemCadastro, 'Informe um e-mail válido, como nome@exemplo.com.');
    email.focus();
    return false;
  }
  if (!senha.validity.valid) {
    mostrarErro(
      mensagemCadastro,
      'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.',
    );
    senha.focus();
    return false;
  }
  if (senha.value !== confirmacao.value) {
    mostrarErro(mensagemCadastro, 'As senhas não conferem.');
    confirmacao.focus();
    return false;
  }
  return true;
}

// Só aceita voltar para páginas do próprio site.
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

abas.login.aba.addEventListener('click', () => mostrarAba('login'));
abas.cadastro.aba.addEventListener('click', () => mostrarAba('cadastro'));

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
    mostrarErro(
      mensagemLogin,
      erro.message === 'E-mail ou senha incorretos.'
        ? 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
        : erro.message,
    );
  }
});

formCadastro.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validarFormularioCadastro()) return;

  const dados = new FormData(formCadastro);
  try {
    cadastrar({
      nome: dados.get('nome'),
      email: dados.get('email'),
      senha: dados.get('senha'),
      tipoCadastro: dados.get('tipoCadastro'),
    });
    location.href = destinoAposLogin();
  } catch (erro) {
    mostrarErro(mensagemCadastro, erro.message);
  }
});

formLogin.addEventListener('input', () => {
  mensagemLogin.textContent = '';
  mensagemLogin.className = 'mensagem';
});

formCadastro.addEventListener('input', () => {
  mensagemCadastro.textContent = '';
  mensagemCadastro.className = 'mensagem';
});

if (new URLSearchParams(location.search).get('aba') === 'cadastro') mostrarAba('cadastro');
