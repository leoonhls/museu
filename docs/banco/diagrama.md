<!-- Responsável: M1 — atualize ao mudar uma tabela na sua migration -->

# Diagrama do banco

O GitHub desenha o diagrama abaixo sozinho. Ele mostra as tabelas de dados do museu; ficam de fora a `sessoes` (logins, gerida pelo `connect-pg-simple`) e a `migracoes` (controle do `npm run db:migrar`).

```mermaid
erDiagram
    categorias ||--o{ obras : classifica
    artistas ||--o{ obras : cria
    exposicoes ||--o{ exposicao_obras : expoe
    obras ||--o{ exposicao_obras : "aparece em"
    exposicoes |o--o{ eventos : "tem"
    usuarios ||--o{ reservas : faz
    eventos |o--o{ reservas : recebe
    usuarios ||--o{ favoritos : marca
    obras ||--o{ favoritos : "é marcada em"
    usuarios ||--o{ historico_conta : registra

    categorias {
        integer id PK
        text nome
    }
    artistas {
        integer id PK
        text nome
        text nacionalidade
        integer ano_nascimento
        integer ano_falecimento
        text biografia
        text foto_url
    }
    obras {
        integer id PK
        text titulo
        integer artista_id FK
        integer categoria_id FK
        integer ano
        text tecnica
        text dimensoes
        text descricao
        text imagem_url
        boolean em_exibicao
        timestamptz criado_em
    }
    exposicoes {
        integer id PK
        text titulo
        text descricao
        date data_inicio
        date data_fim
        text sala
        text imagem_url
    }
    exposicao_obras {
        integer exposicao_id PK, FK
        integer obra_id PK, FK
    }
    eventos {
        integer id PK
        text titulo
        text descricao
        timestamp data_hora
        integer capacidade
        numeric preco
        integer exposicao_id FK
        text imagem_url
    }
    usuarios {
        integer id PK
        text nome
        text email
        text senha_hash
        text papel
        jsonb perfil
        timestamptz criado_em
    }
    favoritos {
        integer usuario_id PK, FK
        integer obra_id PK, FK
        timestamptz criado_em
    }
    historico_conta {
        integer id PK
        integer usuario_id FK
        text tipo
        text descricao
        timestamptz data_hora
    }
    reservas {
        integer id PK
        text codigo
        integer usuario_id FK
        integer evento_id FK
        date data_visita
        integer qtd_inteira
        integer qtd_meia
        numeric valor_total
        text status
        timestamptz criado_em
    }
```

## O que cada tabela guarda

| Tabela | Guarda | Dono | Migration |
| --- | --- | --- | --- |
| `categorias` | Tipos de obra (Pintura, Escultura...). Uma categoria tem várias obras. | M4 | `010_acervo.sql` |
| `artistas` | Artistas do acervo, com biografia e foto. Um artista tem várias obras. | M4 | `010_acervo.sql` |
| `obras` | Obras do acervo, inclusive as criadas no Admin. | M4 | `010_acervo.sql` |
| `exposicoes` | Exposições com período (`data_inicio` a `data_fim`) e sala. | M5 | `020_agenda.sql` |
| `exposicao_obras` | Quais obras estão em cada exposição (ligação N–N). | M5 | `020_agenda.sql` |
| `eventos` | Visitas guiadas, oficinas e palestras, com capacidade e preço; podem pertencer a uma exposição. | M5 | `020_agenda.sql` |
| `usuarios` | Contas de visitantes e do admin, com senha em hash (bcrypt) e as preferências do perfil (`perfil`, em JSON). | M7 | `030_conta.sql` |
| `favoritos` | Obras favoritadas por cada usuário (ligação N–N). | M7 | `030_conta.sql` |
| `historico_conta` | Ações da conta mostradas no perfil (cadastro, login, favoritos...). | M7 | `030_conta.sql` |
| `reservas` | Ingressos reservados: visita comum (sem evento) ou de um evento, com código `MUS-XXXXX`. | M6 | `040_reservas.sql` |

`data_hora` dos eventos é `timestamp` sem fuso: guarda a hora local do museu (Brasília). Compare-a com `LOCALTIMESTAMP` ou `CURRENT_DATE`, nunca com `now()`.
