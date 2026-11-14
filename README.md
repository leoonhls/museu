# Museu de Artes

Projeto acadêmico: site de um museu de artes, feito em três entregas.

| Entrega | Conteúdo | Estado |
| --- | --- | --- |
| 1 | Front-end com HTML, CSS e JavaScript; dados em `client/data/` e `localStorage` | concluída |
| 2 | Backend com Node.js e Express; API REST em `/api` e dados em arquivos JSON | em andamento |
| 3 | Banco de dados PostgreSQL | — |

## Como rodar (Entrega 2)

1. Instale o [Node.js](https://nodejs.org) 22 ou superior (`node -v` para conferir). Quem usa nvm pode rodar `nvm use`: ele lê a versão do arquivo `.nvmrc`.
2. Na pasta do projeto, instale as dependências: `npm install`.
3. Crie o banco de desenvolvimento: `npm run seed`.
4. Ligue o servidor: `npm run dev`. Ele reinicia sozinho quando um arquivo do servidor é salvo.
5. Abra `http://localhost:3000`.

O **Live Server não é mais usado**: quem entrega as páginas é o próprio servidor. Pelo Live Server, as chamadas à API não funcionam.

Para configurar a porta ou o segredo da sessão, copie `.env.example` para `.env` (opcional; sem ele valem os padrões).

## Usuário administrador de teste

- E-mail: `admin@museu.com`
- Senha: `admin123`

A senha fica guardada com hash (bcrypt) no servidor, e o login usa sessão com cookie `httpOnly`.

## Zerar os dados de teste

Pare o servidor e rode `npm run seed`. Isso recria `server/data/db/` a partir de `server/data/seed/`, apagando usuários, histórico da conta, favoritos, reservas e obras criadas no admin. O administrador é recriado.

## Estrutura

- `server/src/` — servidor Express
  - `rotas.js` — junta as rotas dos módulos em `/api`
  - `modulos/<área>/` — rotas, controller e service de cada área
  - `repositorios/` — único acesso aos dados; na Entrega 3 viram consultas SQL
  - `middlewares/` — login, upload e tratamento de erros
- `server/data/seed/` — dados iniciais do acervo e da agenda (versionados)
- `server/data/db/` — banco de desenvolvimento gerado pelo `npm run seed` (fora do Git)
- `server/scripts/seed.js` — recria o banco de desenvolvimento
- `client/js/api.js` — único ponto de acesso a dados no front (chama a API)
- `client/js/components/` — componentes reutilizáveis
- `client/js/utils/` — datas (`datas.js`) e montagem de links (`rotas.js`)
- `client/js/pages/` — um script por página
- `client/pages/` — páginas do site
- `docs/api/` — requisições de teste da API (extensão REST Client)
- `docs/` — guia de uso, equipe e créditos das imagens

Durante a Entrega 2, `client/js/api-local.js`, `client/js/auth-local.js` e `client/data/` ainda existem para as páginas que não migraram para o servidor. Eles serão apagados no fim da entrega.

## Equipe e contribuição

Veja `docs/equipe.md` e `CONTRIBUTING.md`.
