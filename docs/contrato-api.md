# Contrato da API

Fonte de verdade para o formato dos dados. Vale para o `client/js/api.js` (Entrega 1) e para as rotas do Express (Entregas 2 e 3): as funções e as respostas são idênticas nas três entregas.

Mudanças neste arquivo só por PR aprovado por M1 e M4.

## Convenções

- Campos em português e `snake_case`; `id` numérico; chaves estrangeiras como `artista_id`.
- Datas: `AAAA-MM-DD`. Data e hora: `AAAA-MM-DDTHH:MM:SS` (hora local do museu). Carimbos (`criado_em`): ISO 8601 em UTC.
- Lista paginada: `{ "dados": [...], "total": 48, "pagina": 1, "porPagina": 12 }`.
- Erro: `{ "erro": "mensagem" }` com status 400, 401, 403, 404 ou 409. No front, toda função do `api.js` lança `ErroApi` com `status` e `message`.

## Entidades

| Entidade | Campos | Relações |
| --- | --- | --- |
| `obras` | id, titulo, ano, tecnica, dimensoes, descricao, imagem_url, em_exibicao, criado_em | artista_id → artistas; categoria_id → categorias |
| `artistas` | id, nome, nacionalidade, ano_nascimento, ano_falecimento, biografia, foto_url | 1 artista : N obras |
| `categorias` | id, nome | 1 categoria : N obras |
| `exposicoes` | id, titulo, descricao, data_inicio, data_fim, imagem_url, sala | N:N com obras via `exposicao_obras` (no JSON da E1: campo `obra_ids`) |
| `eventos` | id, titulo, descricao, data_hora, capacidade, preco, imagem_url | exposicao_id → exposicoes (opcional) |
| `usuarios` | id, nome, email (único), senha_hash, papel (`visitante` \| `admin`), criado_em | |
| `reservas` | id, codigo, data_visita, qtd_inteira, qtd_meia, valor_total, status (`confirmada` \| `cancelada`), criado_em | usuario_id → usuarios; evento_id → eventos (nulo = visita comum) |
| `favoritos` | usuario_id, obra_id, criado_em | PK composta |

`senha_hash` nunca sai da API.

## Funções e rotas

### Públicas

| Função | Rota | Resposta |
| --- | --- | --- |
| `listarObras({ busca, categoria, artista, anoMin, anoMax, ordem, pagina })` | `GET /api/obras` | Lista paginada de obras, cada uma com `artista_nome` |
| `buscarObra(id)` | `GET /api/obras/:id` | Obra + `artista` (objeto), `categoria` (objeto), `exposicoes` (lista, com `status`) |
| `listarArtistas()` | `GET /api/artistas` | Lista de artistas, por nome |
| `buscarArtista(id)` | `GET /api/artistas/:id` | Artista + `obras` (lista, por ano) |
| `listarCategorias()` | `GET /api/categorias` | Lista de categorias, por nome |
| `listarExposicoes({ status })` | `GET /api/exposicoes?status=` | Lista de exposições com `status` (`atual`, `futura`, `passada`), por data de início |
| `buscarExposicao(id)` | `GET /api/exposicoes/:id` | Exposição + `status` + `obras` (cada uma com `artista_nome`) |
| `listarEventos({ de, ate })` | `GET /api/eventos?de=&ate=` | Lista de eventos com `vagas_restantes`, por data |

Parâmetros de `listarObras`:

- `busca`: texto no título ou no nome do artista, sem diferenciar maiúsculas e acentos.
- `categoria`, `artista`: ids.
- `anoMin`, `anoMax`: inclusivos. `anoMin > anoMax` → 400.
- `ordem`: `titulo` (padrão), `-titulo`, `ano`, `-ano`, `recentes`. Outro valor → 400.
- `pagina`: começa em 1; 12 por página.

### Autenticação

| Função | Rota | Resposta |
| --- | --- | --- |
| `cadastrar({ nome, email, senha })` | `POST /api/auth/cadastro` | Usuário criado (já logado). E-mail duplicado → 409; senha com menos de 6 caracteres → 400 |
| `entrar(email, senha)` | `POST /api/auth/login` | Usuário. Credenciais erradas → 401 |
| `sair()` | `POST /api/auth/logout` | `{ "ok": true }` |
| `usuarioAtual()` | `GET /api/auth/me` | Usuário logado ou `null` |

### Logado (sem login → 401)

| Função | Rota | Resposta |
| --- | --- | --- |
| `listarFavoritos()` | `GET /api/favoritos` | Lista de obras (com `artista_nome` e `favoritado_em`), mais recentes primeiro |
| `favoritar(obraId)` | `POST /api/favoritos/:obraId` | `{ usuario_id, obra_id }`. Repetir não duplica |
| `desfavoritar(obraId)` | `DELETE /api/favoritos/:obraId` | `{ "ok": true }` |
| `criarReserva({ evento_id, data_visita, qtd_inteira, qtd_meia })` | `POST /api/reservas` | Reserva criada, com `codigo` (`MUS-XXXXXX`) e `valor_total` |
| `minhasReservas()` | `GET /api/reservas/minhas` | Reservas do usuário + `evento` (objeto ou `null`), mais recentes primeiro |
| `cancelarReserva(id)` | `DELETE /api/reservas/:id` | Reserva com `status: "cancelada"` |

Regras de reserva (aplicadas no `api.js` na E1 e no *service* na E2):

- Sem `evento_id` é visita comum: `data_visita` obrigatória e não pode ser passada. Inteira R$ 30,00.
- Com `evento_id`: `data_visita` vem do evento; evento passado → 400; acima das vagas → 409. Inteira = `preco` do evento.
- Meia = metade da inteira. De 1 a 10 ingressos por reserva. O preço nunca vem do front.
- Cancelar: só o dono (senão 403), só reserva futura (senão 400), não cancelada (senão 409).

### Admin (sem login → 401; não admin → 403)

| Função | Rota | Resposta |
| --- | --- | --- |
| `criarObra(dados)` | `POST /api/obras` | Obra criada (201 na E2) |
| `editarObra(id, dados)` | `PUT /api/obras/:id` | Obra editada |
| `excluirObra(id)` | `DELETE /api/obras/:id` | `{ "ok": true }`. Remove também os favoritos da obra |
| `enviarImagem(arquivo)` | `POST /api/uploads` | `{ "url": "..." }` para usar em `imagem_url` |

Obrigatórios em obra: `titulo`, `ano` (inteiro, > 0, até o ano atual), `tecnica`, `artista_id` e `categoria_id` existentes, `imagem_url`. Faltando → 400 com a lista dos campos.

Upload: só imagens. Na E1 até 300 KB, devolvido como *data URL*; na E2 até 2 MB, salvo em `client/assets/img/obras/`.
