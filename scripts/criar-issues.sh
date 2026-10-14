#!/usr/bin/env bash
# Cria labels e uma issue por tarefa da Entrega 1 no repositório atual.
# Uso: scripts/criar-issues.sh   (requer gh autenticado, rodar na raiz do repo)
set -euo pipefail

label() { gh label create "$1" --color "$2" --description "${3:-}" --force >/dev/null; }

label entrega-1 0e8a16 "Entrega 1 — Front-end"
label entrega-2 1d76db "Entrega 2 — Backend"
label entrega-3 5319e7 "Entrega 3 — Banco de dados"
label integracao  bfd4f2 "M1"
label layout      f9d0c4 "M2"
label galeria     fef2c0 "M3"
label obra-artista c2e0c6 "M4"
label exposicoes  d4c5f9 "M5"
label ingressos   fbca04 "M6"
label login       e99695 "M7"
label admin       b60205 "M8"

issue() { # area titulo corpo
  gh issue create --title "[E1][$1] $2" --label "entrega-1,$1" --body "$3" >/dev/null
  echo "  criada: [$1] $2"
}

while IFS='|' read -r area titulo corpo; do
  [ -z "$area" ] && continue
  issue "$area" "$titulo" "$corpo"
done <<'TAREFAS'
integracao|Criar repositório, estrutura de pastas, README, template de PR e issues|Estrutura conforme o plano. Feito no commit inicial.
integracao|api.js com todas as funções do contrato|Esqueleto e implementação completa com JSON + localStorage. Ver docs/contrato-api.md.
integracao|auth.js: sessão do usuário e proteção de páginas|usuarioLogado(), exigirLogin(), exigirAdmin(), evento sessao-alterada.
integracao|Revisar PRs: nenhuma página acessa JSON ou localStorage direto|Bloquear merge de PR que leia dados fora do api.js.
layout|base.css: variáveis de cor, fonte, espaçamento, reset e grid responsivo|
layout|Componentes header, footer, toast e modal|Header muda se logado ou admin (escutar o evento sessao-alterada).
layout|Home: exposição atual, obras em destaque, próximos eventos|index.html + js/pages/home.js
layout|Responsividade (360/768/1280 px) e acessibilidade básica|alt nas imagens, contraste, foco visível.
galeria|obras.html com grid de card-obra|js/components/card-obra.js + js/pages/galeria.js
galeria|Filtros: busca, categoria, artista, intervalo de anos; ordenação|Usar listarObras({ busca, categoria, artista, anoMin, anoMax, ordem }).
galeria|Filtros refletidos na URL|Ex.: ?categoria=2&pagina=3, link compartilhável.
galeria|Paginação e estado de nenhuma obra encontrada|
obra-artista|Montar obras.json, artistas.json, categorias.json com dados reais|Meta: 40 obras, 15 artistas, 5 categorias. Imagens em domínio público, até 300 KB. Substituir os dados de exemplo.
obra-artista|obra.html?id=: imagem ampliável, ficha técnica, artista e exposições|buscarObra(id) já devolve artista, categoria e exposições.
obra-artista|artista.html?id=: biografia e obras|buscarArtista(id)
exposicoes|Montar exposicoes.json (com obra_ids) e eventos.json|Meta: 4 exposições (passada, atual, futura) e 8 eventos.
exposicoes|exposicoes.html com abas Atual, Futuras, Passadas e detalhe|listarExposicoes({ status }), buscarExposicao(id)
exposicoes|eventos.html como agenda por mês com vagas restantes|listarEventos({ de, ate })
ingressos|ingressos.html: visita comum ou evento, data, inteira e meia|
ingressos|Total, bloqueio de datas passadas e evento lotado, exigir login|Erros vêm do api.js com status 400/409.
ingressos|Código da reserva, comprovante e minhas reservas no perfil|
login|login.html com abas Entrar e Cadastrar e validação|Usar entrar/cadastrar do auth.js e voltarDoLogin().
login|perfil.html: dados, favoritos e reservas|
login|Botão de favoritar no card e na página da obra|Pede login se necessário (urlLogin()).
admin|admin/obras.html: tabela com busca, editar e excluir|Excluir com confirmação.
admin|admin/obra-form.html: criar e editar com selects de artista e categoria|
admin|Pré-visualização da imagem|enviarImagem(arquivo) devolve { url } (data URL até 300 KB).
admin|Validação de campos obrigatórios e mensagens de erro|
TAREFAS

echo "Pronto. Atribua cada issue ao responsável e adicione ao quadro do Projects."
