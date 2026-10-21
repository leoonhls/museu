// Alternar telas de Login e Cadastro
const boxLogin = document.getElementById('boxLogin');
const boxCadastro = document.getElementById('boxCadastro');
const btnIrCadastro = document.getElementById('btnIrCadastro');
const btnIrLogin = document.getElementById('btnIrLogin');

if (btnIrCadastro && btnIrLogin) {
    btnIrCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        boxLogin.style.display = 'none';
        boxCadastro.style.display = 'block';
    });
    btnIrLogin.addEventListener('click', (e) => {
        e.preventDefault();
        boxCadastro.style.display = 'none';
        boxLogin.style.display = 'block';
    });
}

// Utilitários do LocalStorage
function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios_ufu')) || [];
}

function setUsuarioLogado(usuario) {
    localStorage.setItem('usuario_logado_ufu', JSON.stringify(usuario));
}

function getUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuario_logado_ufu'));
}

// Atualizar menu de navegação
function atualizarNav() {
    const usuario = getUsuarioLogado();
    const linkLogin = document.getElementById('linkLogin');
    const linkPerfil = document.getElementById('linkPerfil');

    if (usuario && linkLogin && linkPerfil) {
        linkLogin.style.display = 'none';
        linkPerfil.style.display = 'inline';
    }
}
document.addEventListener('DOMContentLoaded', atualizarNav);

// Cadastro de Utilizador (Lógica do Professor aprimorada)
const formCadastro = document.getElementById('formCadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', function (event) {
        event.preventDefault();
        const msgFeedback = document.getElementById('mensagemFeedback');
        const usuarioInput = document.getElementById('usuario').value.trim();
        const senhaInput = document.getElementById('senha').value;
        const confirmarSenhaInput = document.getElementById('confirmarSenha').value;

        msgFeedback.className = "mensagem";
        msgFeedback.innerText = "";

        if (senhaInput !== confirmarSenhaInput) {
            msgFeedback.innerText = "As senhas não coincidem!";
            msgFeedback.classList.add('erro');
            return;
        }

        const usuarios = getUsuarios();
        if (usuarios.find(u => u.usuario === usuarioInput)) {
            msgFeedback.innerText = "Usuário já existe!";
            msgFeedback.classList.add('erro');
            return;
        }

        // Novo utilizador com estrutura para favoritos e reservas
        const novoUsuario = {
            usuario: usuarioInput,
            senha: senhaInput,
            favoritos: [],
            reservas: [
                { id: 101, obra: "Estruturas de Dados em C", status: "Confirmada", data: "2026-10-15" }
            ]
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios_ufu', JSON.stringify(usuarios));

        msgFeedback.innerText = `Usuário "${usuarioInput}" cadastrado com sucesso!`;
        msgFeedback.classList.add('sucesso');
        formCadastro.reset();

        setTimeout(() => {
            boxCadastro.style.display = 'none';
            boxLogin.style.display = 'block';
        }, 1500);
    });
}

// Login de Utilizador
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', function (event) {
        event.preventDefault();
        const msgLogin = document.getElementById('msgLogin');
        const usuarioInput = document.getElementById('loginUsuario').value.trim();
        const senhaInput = document.getElementById('loginSenha').value;

        const usuarios = getUsuarios();
        const usuarioEncontrado = usuarios.find(u => u.usuario === usuarioInput && u.senha === senhaInput);

        if (!usuarioEncontrado) {
            msgLogin.innerText = "Usuário ou senha incorretos!";
            msgLogin.className = "mensagem erro";
            return;
        }

        setUsuarioLogado(usuarioEncontrado);
        window.location.href = "perfil.html";
    });
}