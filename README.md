# Museu de Artes

Projeto acadêmico: site de um museu de artes, feito em três entregas.

| Entrega | Conteúdo | Estado |
| --- | --- | --- |
| 1 | Front-end com HTML, CSS e JavaScript; dados em `client/data/` e `localStorage` | concluída |
| 2 | Backend com Node.js e Express; API REST em `/api` e dados em arquivos JSON | concluída |
| 3 | Banco de dados PostgreSQL 16; migrations, repositórios em SQL e sessões no banco | em andamento |

## Como rodar (Entrega 3)

1. Instale o [Node.js](https://nodejs.org) 22 ou superior (`node -v` para conferir). Quem usa nvm pode rodar `nvm use`: ele lê a versão do arquivo `.nvmrc`.
2. Instale o banco, de um destes dois jeitos:
   - **Docker (recomendado):** instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) e, na pasta do projeto, rode `docker compose up -d`. Isso liga o PostgreSQL 16 no container `museu-banco`, na porta 5432. Confira com `docker compose ps` (deve aparecer `healthy`).
   - **Sem Docker:** instale o [PostgreSQL 16](https://www.postgresql.org/download/) e crie o usuário `museu`, com senha `museu`, dono de um banco também chamado `museu`. Exemplo no `psql` como superusuário: `CREATE USER museu WITH PASSWORD 'museu'; CREATE DATABASE museu OWNER museu;`
3. Crie o arquivo de configuração: `cp .env.example .env` (funciona também no terminal do VS Code no Windows). **É obrigatório:** sem ele, o `npm run dev` quebra em algumas versões do Node 22 com o erro `ENOENT: no such file or directory, watch '.../.env'`.
4. Instale as dependências: `npm install`.
5. Crie as tabelas e os dados iniciais: `npm run db:reset`.
6. Ligue o servidor: `npm run dev`. Ele reinicia sozinho quando um arquivo do servidor é salvo.
7. Abra `http://localhost:3000`.

O **Live Server não é usado**: quem entrega as páginas é o próprio servidor.

No `.env` ficam a porta, o segredo da sessão e o endereço do banco. Os valores do `.env.example` já apontam para o banco do Docker. O `.env` fica fora do Git.

### Scripts do banco

| Script | O que faz |
| --- | --- |
| `npm run db:migrar` | Aplica as migrations de `server/db/migrations/` que ainda não rodaram (a tabela `migracoes` guarda quais já rodaram). |
| `npm run db:seed` | Apaga os dados e insere de novo os dados iniciais de `server/data/seed/` e o administrador. |
| `npm run db:demo` | Acrescenta os dados de demonstração (script `server/scripts/demo.js`, do M2). |
| `npm run db:reset` | **Apaga o banco local inteiro** e recria: migrations + seed. Só roda se o banco estiver em `localhost`. Use depois de todo Pull que mudar uma migration. |

### Abrir o banco no VS Code

Instale as extensões recomendadas **SQLTools** e **SQLTools PostgreSQL Driver** (o VS Code sugere ao abrir o projeto). A conexão **Museu (local)** já vem configurada em `.vscode/settings.json`: abra o painel do SQLTools, conecte e rode as consultas de `docs/sql/`. O diagrama das tabelas está em `docs/banco/diagrama.md`.

## Usuário administrador de teste

- E-mail: `admin@museu.com`
- Senha: `admin123`

A senha fica guardada com hash (bcrypt) no servidor, e o login usa sessão com cookie `httpOnly`.

## Zerar os dados de teste

Rode `npm run db:reset`. Isso apaga usuários, histórico da conta, favoritos, reservas, sessões e obras criadas no admin, e recria tudo a partir de `server/data/seed/`. O administrador é recriado.

## Estrutura

- `server/src/` — servidor Express
  - `rotas.js` — junta as rotas dos módulos em `/api`
  - `modulos/<área>/` — rotas, controller e service de cada área
  - `repositorios/` — único acesso aos dados: consultas SQL ao PostgreSQL
  - `db.js` — conexão com o banco (`consultar`, `consultarUm`, `transacao`)
  - `middlewares/` — login, upload e tratamento de erros (inclusive os do banco)
- `server/db/migrations/` — esquema do banco, um arquivo `.sql` por área, aplicados em ordem
- `server/data/seed/` — dados iniciais do acervo e da agenda (versionados)
- `server/scripts/` — `migrar.js`, `seed.js` e `resetar.js` (scripts `db:*`)
- `docker-compose.yml` — banco PostgreSQL de desenvolvimento
- `client/js/api.js` — único ponto de acesso a dados no front (chama a API)
- `client/js/components/` — componentes reutilizáveis
- `client/js/utils/` — datas (`datas.js`) e montagem de links (`rotas.js`)
- `client/js/pages/` — um script por página
- `client/pages/` — páginas do site
- `docs/api/` — requisições de teste da API (extensão REST Client)
- `docs/banco/diagrama.md` — diagrama entidade-relacionamento
- `docs/sql/` — rascunhos de consultas de cada área, para rodar no SQLTools
- `docs/` — guia de uso, equipe e créditos das imagens

## Equipe e contribuição

Veja `docs/equipe.md` e `CONTRIBUTING.md`.
