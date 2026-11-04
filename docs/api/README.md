# Testar a API com o REST Client

Cada módulo do servidor tem um arquivo `.http` nesta pasta, com uma requisição de exemplo por rota.

1. No VS Code, instale a extensão **REST Client** (`humao.rest-client`). Ela aparece nas extensões recomendadas do projeto.
2. Suba o servidor: `npm run dev`.
3. Abra o arquivo `.http` do seu módulo e clique em **Send Request**, que aparece acima de cada bloco `###`.
4. A resposta abre ao lado, com o status, os cabeçalhos e o JSON.

O cookie de sessão é guardado entre as requisições do mesmo arquivo: rode primeiro o bloco de login e depois as rotas que exigem usuário logado.

Para voltar o banco ao estado inicial, pare o servidor e rode `npm run seed`.

| Arquivo | Módulo | Dono |
| --- | --- | --- |
| `destaques.http` | destaques | M2 |
| `galeria.http` | galeria | M3 |
| `acervo.http` | acervo | M4 |
| `agenda.http` | agenda | M5 |
| `reservas.http` | reservas | M6 |
| `conta.http` | conta | M7 |
| `admin.http` | admin | M8 |
