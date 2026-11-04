# Como contribuir

O passo a passo completo está no **Guia da Entrega 1** (PDF enviado no grupo). Resumo:

1. Antes de começar: troque para a `main` e dê **Pull** no painel Controle do Código-Fonte do VS Code.
2. Crie uma branch `feat/<sua-area>-<o-que-vai-fazer>` (minúsculas, sem acento).
3. Faça commits pequenos: `feat:`, `fix:`, `style:`, `docs:` ou `refactor:` + frase curta no presente.
4. Publique a branch e abra um Pull Request para a `main`, com o M1 como revisor.
5. Preencha o checklist do PR. Merge só depois da aprovação.

## Regras

- Dados só pelo `client/js/api.js`: nenhum outro arquivo importa `client/data/` ou usa `localStorage`.
- Cada um mexe nos seus arquivos (o dono está no comentário da primeira linha). Precisa mudar arquivo de outra área? Combine com o dono.
- Cores, fontes e espaçamentos só pelas variáveis de `client/css/base.css`.
- Na Entrega 1 não usamos `async`, `await` nem `fetch`.

## Entrega 2

O passo a passo de cada área está no **Guia da Entrega 2** (PDF enviado no grupo).

Depois de cada Pull na `main`: se o `package.json` mudou, rode `npm install`; se `server/data/seed/` mudou, rode `npm run seed`.

### Fluxo de cada área

1. Implemente a sua rota no servidor (`server/src/modulos/<sua área>/`).
2. Teste no seu arquivo `docs/api/<módulo>.http`, inclusive os casos de erro.
3. Nas suas páginas, troque o import de `api-local.js` para `api.js` (e `auth-local.js` para `auth.js`), coloque `await` nas chamadas e mostre "carregando" e erro com `components/estado.js`.

### Regras do backend

1. Só os repositórios leem ou gravam `server/data/`.
2. Services não usam `req` nem `res`; controllers não têm regras de negócio.
3. Toda entrada do usuário é validada no servidor, mesmo que o front já valide.
4. O servidor nunca confia em preço, papel ou id de usuário vindos do front: usa `req.session` e os dados do repositório.
5. Nenhuma resposta contém `senha_hash`.
6. Erros esperados são `ErroApi` (de `server/src/erros.js`); nunca `res.status(500)` à mão.
