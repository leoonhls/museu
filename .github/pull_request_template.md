## O que este PR faz

<!-- Descreva em uma ou duas frases. -->

Closes #

## Como testar

1.

## Print da tela

<!-- Cole a imagem aqui. -->

## Checklist

- [ ] O servidor sobe com `npm run dev` e a página abre em http://localhost:3000 sem nenhum erro vermelho no Console (F12)
- [ ] Testei no tamanho de celular (360 px)
- [ ] Nenhum import de client/data/ nem localStorage fora do api.js
- [ ] Usei as variáveis do base.css para cores e espaçamentos
- [ ] Toda imagem tem alt com descrição
- [ ] Tratei erros com try/catch e mostrei mensagem ao usuário
- [ ] Tratei o estado “nenhum resultado”
- [ ] Apaguei console.log de teste e código comentado que não serve mais
- [ ] Mesclei a main na minha branch antes de enviar e o site continuou funcionando

### Entrega 2

- [ ] Testei as minhas rotas no arquivo `docs/api/<modulo>.http`
- [ ] Erros respondem com o status certo e `{ "erro": "..." }`
- [ ] Nenhuma resposta contém `senha_hash`
- [ ] Minhas páginas usam `api.js` (não `api-local.js`) com `await` e mostram “carregando” e erro de conexão
- [ ] Ninguém além dos repositórios lê `server/data/`
