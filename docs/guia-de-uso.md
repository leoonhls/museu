# Museu de Artes — como acessar e navegar

O site da Entrega 1 roda direto no navegador, pelo Live Server do VS Code. Não há servidor nem banco de dados: os dados vêm de `client/data/` e o que você cria (contas, favoritos, reservas, obras do admin) fica salvo no `localStorage` do seu navegador.

## 1. Como acessar

1. Clone o repositório e abra a pasta no VS Code:
   ```bash
   git clone https://github.com/leoonhls/museu.git
   code museu
   ```
   Se já tem o projeto, troque para a `main` e dê **Pull**.
2. Aceite instalar as extensões recomendadas (Live Server, Prettier e EditorConfig).
3. Clique com o botão direito em `client/index.html` → **Open with Live Server**.
4. O site abre em `http://127.0.0.1:5500/`.

Não abra o HTML com dois cliques: em endereços `file://` o navegador bloqueia os módulos JavaScript e a página fica em branco.

## 2. Usuários de teste

| Perfil | E-mail | Senha | Como conseguir |
| --- | --- | --- | --- |
| Administrador | `admin@museu.com` | `admin123` | Já existe. É criado sozinho no primeiro acesso. |
| Visitante | o que você quiser | 8+ caracteres, com letras e números | Crie em **Entrar → aba Criar conta**. Ex.: `visitante@teste.com` / `senha1234`. |

- Ao criar a conta, o visitante já entra logado.
- Cada navegador tem os próprios dados: uma conta criada no Chrome não existe no Firefox nem numa janela anônima.
- O login da Entrega 1 é simulado e **não é seguro**. Ele será trocado por autenticação no servidor na Entrega 2.

## 3. Mapa do site

O menu do topo leva a Acervo, Exposições, Eventos e Ingressos. À direita aparece **Entrar** (deslogado) ou **Meu perfil** e **Sair** (logado). O administrador vê também **Admin**. No celular, o menu fica atrás do botão ☰.

| Página | Endereço | O que tem | Quem abre |
| --- | --- | --- | --- |
| Início | `/index.html` | Exposição em cartaz, 6 obras em destaque, linha do tempo e 3 próximos eventos | Todos |
| Acervo | `/pages/obras.html` | As 40 obras, com busca, filtros, ordenação e paginação | Todos |
| Obra | `/pages/obra.html?id=1` | Imagem ampliável, ficha técnica, exposições e mais obras do artista | Todos |
| Artista | `/pages/artista.html?id=1` | Biografia e obras do artista | Todos |
| Exposições | `/pages/exposicoes.html` | Abas Atuais, Futuras e Passadas | Todos |
| Exposição | `/pages/exposicao.html?id=1` | Detalhes, obras expostas e eventos ligados | Todos |
| Eventos | `/pages/eventos.html` | Agenda por mês, com vagas e preço | Todos |
| Entrar | `/pages/login.html` | Abas Entrar e Criar conta | Todos |
| Catálogo de estilos | `/pages/estilos.html` | Botões, campos, cards e toasts do design system | Todos |
| Ingressos | `/pages/ingressos.html` | Reserva em 3 etapas | Logado |
| Comprovante | `/pages/reserva.html?codigo=MUS-XXXXX` | Dados da reserva e botão de imprimir | Logado (dono da reserva) |
| Meu perfil | `/pages/perfil.html` | Abas Meus dados, Favoritos e Minhas reservas | Logado |
| Gerenciar acervo | `/pages/admin/obras.html` | Tabela de obras com busca, editar e excluir | Administrador |
| Obra — Admin | `/pages/admin/obra-form.html` | Formulário para criar ou editar obra | Administrador |

Quem abre uma página de login sem estar logado vai para o **Entrar** e, depois de entrar, volta para a página que queria. Um visitante que tenta abrir o Admin volta para o Início.

## 4. Roteiro 1 — visitante sem login

1. No **Início**, clique na exposição em cartaz e em uma das obras em destaque.
2. Vá em **Acervo**:
   - digite `monet` na busca (a lista atualiza sozinha, sem diferenciar acentos);
   - filtre por **Categoria**, **Artista** e **Período** (De/Até), e troque a ordenação;
   - vá para a página 2 e use o botão Voltar do navegador: a galeria volta para a página 1;
   - copie a URL com filtros e abra em outra aba: os filtros continuam aplicados.
3. Abra uma obra. Clique na imagem para ampliar (Esc fecha). Clique no nome do artista para ver a página dele.
4. Em **Exposições**, troque entre Atuais, Futuras e Passadas e abra uma exposição.
5. Em **Eventos**, veja a agenda. A "Oficina de desenho para iniciantes" tem só 5 vagas.
6. Clique no ♡ de uma obra: como você não está logado, o site pede login.

## 5. Roteiro 2 — visitante com conta

1. Clique em **Entrar → Criar conta**, preencha e confirme. Você volta logado.
2. **Favoritos:** clique no ♡ de algumas obras (no acervo ou na página da obra). Confira em **Meu perfil → Favoritos**.
3. **Reserva de evento:**
   1. Em **Eventos**, clique em **Reservar ingressos** na "Visita guiada: Luz e Cor".
   2. Escolha inteiras e meias e clique em **Continuar** (etapa 2: confira os dados).
   3. Clique em **Confirmar reserva** (etapa 3: aparece o código `MUS-XXXXX`).
   4. Clique em **Ver comprovante** e teste o botão de imprimir.
4. **Reserva de visita comum:** em **Ingressos**, escolha "Visita ao museu" e uma data entre amanhã e os próximos 60 dias, fora de segunda-feira.
5. **Testes de erro:**
   - na "Oficina de desenho para iniciantes", peça 6 ingressos → "Restam apenas 5 vagas para este evento.";
   - escolha uma segunda-feira → "O museu fecha às segundas-feiras.";
   - peça 11 ingressos → erro de máximo por reserva.
6. **Cancelar:** em **Meu perfil → Minhas reservas**, clique em **Cancelar reserva** e confirme. A reserva fica como Cancelada e as vagas do evento voltam.
7. Em **Meu perfil → Meus dados**, edite biografia, foto (até 200 KB) e as opções de acessibilidade (alto contraste, reduzir animações).
8. Clique em **Sair**.

## 6. Roteiro 3 — administrador

1. Entre com `admin@museu.com` / `admin123`. O menu mostra **Admin**.
2. Em **Admin**, use a busca e a paginação da tabela.
3. Clique em **+ Nova obra** e preencha:
   - título, artista, categoria, ano, técnica e descrição (mínimo de 20 caracteres);
   - endereço da imagem começando com `/` ou `https://`. Exemplo: `/assets/img/placeholder.svg`.
   Ao salvar, você volta para a tabela e a obra aparece no Acervo.
4. Clique em **Editar** numa obra, mude o título e salve.
5. Clique em **Excluir** e confirme. A obra some do Acervo e dos favoritos de quem a tinha.

## 7. Regras de reserva e dados de teste

| Regra | Valor |
| --- | --- |
| Preço da inteira (visita comum) | R$ 30,00 |
| Meia-entrada | metade do preço |
| Ingressos por reserva | de 1 a 10 |
| Data da visita comum | de amanhã até 60 dias à frente |
| Dia fechado | segunda-feira |
| Reserva de evento | a data é a do evento; precisa ter vagas e o evento não pode ter passado |

**Zerar os dados de teste:** abra o Console do navegador (`F12`), rode o comando abaixo e recarregue a página. Isso apaga contas, favoritos, reservas e obras criadas no Admin. O administrador é recriado no próximo acesso.

```js
import('/js/api.js').then((api) => api.resetarDados())
```
