# Museu de Artes

Site de um museu de artes com galeria filtrável, páginas de obra e artista, exposições, agenda de eventos, reserva de ingressos, login de visitante com favoritos e área administrativa.

O projeto é feito em três entregas. O site funciona por completo em todas elas; o que muda é onde os dados ficam:

| Entrega | Dados | Tag |
| --- | --- | --- |
| 1 — Front-end | JSON em `client/data/` + `localStorage` | `entrega-1` |
| 2 — Backend | Express + JSON em `server/data/` | `entrega-2` |
| 3 — Banco | PostgreSQL | `entrega-3` |

## Como rodar (Entrega 1)

Requisitos: VS Code com a extensão **Live Server** (o VS Code sugere a instalação ao abrir a pasta).

1. Clone o repositório e abra a pasta no VS Code.
2. Clique em **Go Live** na barra de status. O projeto já vem configurado para servir a pasta `client/` (veja `.vscode/settings.json`).
3. O site abre em `http://127.0.0.1:5500`.

Abrir o HTML direto pelo arquivo (`file://`) **não funciona**: o navegador bloqueia o `fetch` dos JSONs e os módulos ES.

Sem VS Code, qualquer servidor estático na pasta `client/` serve, por exemplo `npx serve client` ou `python3 -m http.server -d client 5500`.

### Contas de teste

| Papel | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@museu.com` | `admin123` |

Visitantes podem se cadastrar pela página de login.

> **Atenção:** na Entrega 1 o login é simulado. Usuários, favoritos, reservas e obras criadas pelo admin ficam no `localStorage` do navegador, e a senha é guardada apenas com um hash SHA-256 sem sal. **Isso não é seguro.** Na Entrega 2 será substituído por autenticação no servidor com `bcrypt` e sessão em cookie `httpOnly`.
>
> Para zerar os dados locais, rode no console do navegador: `Object.keys(localStorage).filter(k => k.startsWith('museu:')).forEach(k => localStorage.removeItem(k))`.

## Estrutura

```
client/
├── index.html
├── pages/          uma página por funcionalidade (admin/ para a área administrativa)
├── css/            base.css, components.css, pages/*.css
├── js/
│   ├── api.js      ÚNICO ponto de acesso a dados
│   ├── auth.js     sessão no front: exigirLogin(), exigirAdmin()
│   ├── components/ header, footer, card-obra, modal, toast
│   └── pages/      um script por página
├── data/           JSONs (só na Entrega 1)
└── assets/img/     obras/, artistas/, exposicoes/
docs/               contrato da API e decisões
```

## Regra principal

**Nenhuma página acessa dados diretamente.** Tudo passa por `client/js/api.js`: nada de `fetch('/data/...')` nem `localStorage` fora dele. Assim, na Entrega 2 só o `api.js` muda e nenhuma página precisa ser reescrita. PRs que quebram essa regra não são aprovados.

```js
import * as api from '/js/api.js';
import { exigirLogin } from '/js/auth.js';

const usuario = await exigirLogin();            // redireciona para o login se precisar
const { dados, total } = await api.listarObras({ categoria: 2, pagina: 1 });

try {
  await api.favoritar(5);
} catch (erro) {
  // erro.status: 400, 401, 403, 404 ou 409; erro.message: texto para o usuário
}
```

As funções, parâmetros e formatos de resposta estão em [docs/contrato-api.md](docs/contrato-api.md).

## Como contribuir

- `main` é protegida. Cada tarefa tem uma issue e uma branch `feat/<area>-<descricao>` (ex.: `feat/galeria-filtro-ano`).
- Merge só por Pull Request com 1 aprovação. Preencha o checklist do template.
- Commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`.
- Campos de dados em português e `snake_case` (`data_inicio`); variáveis e funções em `camelCase`.
- Mova a issue no quadro do GitHub Projects: A fazer → Fazendo → Em revisão → Feito.
- Imagens de obras em domínio público (Wikimedia Commons, Rijksmuseum, Met Open Access), com até 300 KB, salvas como `assets/img/obras/<id>.jpg`.

## Time

| Membro | Área |
| --- | --- |
| M1 | Líder técnico e integração |
| M2 | Layout e design system |
| M3 | Galeria e filtros |
| M4 | Obra, artista e categorias |
| M5 | Exposições e eventos |
| M6 | Reserva de ingressos |
| M7 | Login e favoritos |
| M8 | Área admin |
