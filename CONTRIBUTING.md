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
