# Museu de Artes

Projeto acadêmico: site de um museu de artes, feito em três entregas.

| Entrega | Conteúdo | Estado |
| --- | --- | --- |
| 1 | Front-end com HTML, CSS e JavaScript; dados em `client/data/` e `localStorage` | concluída |
| 2 | Backend com Node.js e Express | — |
| 3 | Banco de dados PostgreSQL | — |

## Como rodar (Entrega 1)

1. Abra a pasta do projeto no VS Code e aceite instalar as extensões recomendadas.
2. Clique com o botão direito em `client/index.html` → **Open with Live Server**.
3. O site abre em `http://127.0.0.1:5500/`.

Não abra o HTML com dois cliques: o navegador bloqueia os módulos JavaScript em endereços `file://`.

## Usuário administrador de teste

- E-mail: `admin@museu.com`
- Senha: `admin123`

Na Entrega 1 o login é simulado no navegador e **não é seguro**. Ele será substituído por autenticação no servidor na Entrega 2.

## Zerar os dados de teste

No Console do navegador (`F12`), rode `import('/js/api.js').then(api => api.resetarDados())` e recarregue a página. Isso apaga usuários, favoritos, reservas e obras criadas no admin.

## Estrutura

- `client/data/` — dados do acervo (obras, artistas, exposições, eventos)
- `client/js/api.js` — único ponto de acesso a dados
- `client/js/components/` — componentes reutilizáveis
- `client/js/utils/` — datas (`datas.js`) e montagem de links (`rotas.js`)
- `client/js/pages/` — um script por página
- `client/pages/` — páginas do site
- `docs/` — equipe e créditos das imagens

## Equipe e contribuição

Veja `docs/equipe.md` e `CONTRIBUTING.md`.
