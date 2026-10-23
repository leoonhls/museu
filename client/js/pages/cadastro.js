import { cadastrar } from '../api.js';
import { montarHeader } from '../components/header.js';
import { montarFooter } from '../components/footer.js';
import { caminhoInicio } from '../utils/rotas.js';

montarHeader();
montarFooter();

const formCadastro = document.getElementById('formCadastro');
const mensagemCadastro = document.getElementById('mensagemCadastro');

function mostrarErro(mensagem) {
  mensagemCadastro.className = 'mensagem mensagem--erro';
  mensagemCadastro.textContent = mensagem;
}

function validarFormulario() {
  const campos = [...formCadastro.elements];
  const campoVazio = campos.find((campo) => campo.willValidate && campo.validity.valueMissing);
  if (campoVazio) {
    const mensagem = campoVazio.name === 'confirmarSenha'
      ? 'Confirme sua senha.'
      : 'Preencha este campo.';
    mostrarErro(mensagem);
    campoVazio.focus();
    return false;
  }

  const email = document.getElementById('emailCadastro');
  const senha = document.getElementById('senhaCadastro');
  const confirmacao = document.getElementById('confirmarSenhaCadastro');
  if (!email.validity.valid) {
    mostrarErro('Informe um e-mail válido, como nome@exemplo.com.');
    email.focus();
    return false;
  }

  const nome = document.getElementById('nomeCadastro');
  if (nome.validity.tooShort) {
    mostrarErro('O nome deve ter pelo menos 3 caracteres.');
    nome.focus();
    return false;
  }

  if (senha.value !== confirmacao.value) {
    mostrarErro('As senhas não conferem.');
    confirmacao.focus();
    return false;
  }

  const campoInvalido = campos.find((campo) => campo.willValidate && !campo.validity.valid);
  if (!campoInvalido) return true;

  const mensagem = campoInvalido.name === 'senha' || campoInvalido.name === 'confirmarSenha'
    ? 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.'
    : 'Confira o valor informado.';
  mostrarErro(mensagem);
  campoInvalido.focus();
  return false;
}

document.querySelectorAll('[data-alvo-senha]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const campo = document.getElementById(botao.dataset.alvoSenha);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    botao.setAttribute('aria-pressed', String(mostrar));
  });
});

formCadastro.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validarFormulario()) return;

  const dados = new FormData(formCadastro);
  try {
    cadastrar({
      nome: dados.get('nome'),
      email: dados.get('email'),
      senha: dados.get('senha'),
      tipoCadastro: dados.get('tipoCadastro'),
    });
    location.href = caminhoInicio();
  } catch (erro) {
    mostrarErro(erro.message);
  }
});

formCadastro.addEventListener('input', () => {
  mensagemCadastro.textContent = '';
  mensagemCadastro.className = 'mensagem';
});
