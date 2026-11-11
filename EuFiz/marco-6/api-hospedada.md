
# Marco 6 — Issue 40: Migrar a API para um serviço hospedado

**Responsável:** Lucas Rozendo  
**Branch:** feature/marco6-issue-40  
**Issue:** #43

## Objetivo

Migrar a API local para um servidor acessível pela internet, mantendo o contrato de dados e os endpoints utilizados pelo React.

## Implementação

Foi utilizado o Render para hospedar o JSON Server já existente no projeto.

No package.json, foi criado o script:

```json
"api:render": "node servidor-api.js db.json --host 0.0.0.0 --port ${PORT:-10000}"
```

O Render executa esse comando em seu servidor, disponibilizando a API por HTTPS.

Também foi atualizado o arquivo `.env.production`:

```env
VITE_API_URL=https://g2frontend-api.onrender.com
```

O Vite utiliza essa variável durante o build para configurar o endereço da API consumida pelo frontend.

## Testes realizados

- Build de produção executado sem erros.
- Listagem de tarefas e projetos funcionando.
- Navegação entre as telas funcionando com a API hospedada.
- Criação de tarefas via POST funcionando.
- Edição de tarefas via PATCH funcionando.
- Exclusão de tarefas via DELETE funcionando.

## Limitações

O serviço utiliza o plano gratuito do Render.

Após um período de inatividade, o servidor pode ser suspenso. As alterações feitas no db.json hospedado não possuem persistência garantida e podem ser perdidas após a suspensão ou reinicialização.

O db.json local permanece independente dos dados armazenados no Render.

## Relação com o React

O React continua responsável pela interface e pelo gerenciamento de estados.

As requisições HTTP são realizadas pelas funções centralizadas em src/api.ts. Assim, a migração da API não exigiu alterações nos componentes React.

A configuração da URL por variável de ambiente é realizada pelo Vite, não diretamente pelo React.

## Resultado

A API foi disponibilizada publicamente, mantendo o funcionamento das operações CRUD e permitindo que o frontend consuma os dados pela internet.
