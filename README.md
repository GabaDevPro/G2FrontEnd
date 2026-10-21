# Gerenciador de Tarefas

Projeto em equipe da disciplina de Desenvolvimento Frontend: um gerenciador de tarefas e projetos que busca os dados em uma API local.

## Equipe: Caio e os esquilos

| Integrante | GitHub |
| --- | --- |
| Caio Dias | [@Andcaio](https://github.com/Andcaio) |
| Gabriel Rodrigues | [@GabaDevPro](https://github.com/GabaDevPro) |
| Lucas Rozendo | [@Lucas-Rozendo](https://github.com/Lucas-Rozendo) |
| Ricardo Francisco Real | [@RicardoRealDev](https://github.com/RicardoRealDev) |

## Framework

[React](https://react.dev) 19 com TypeScript, criado pelo comando oficial do [Vite](https://vite.dev). A navegação entre as telas usa o [React Router](https://reactrouter.com) 7, e a API local é feita com o [json-server](https://github.com/typicode/json-server) a partir do arquivo `db.json`.

## Como rodar

É preciso ter o [Node.js](https://nodejs.org) 22.12 ou mais novo.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Em um terminal, suba a API (fica em `http://localhost:3000`):

   ```bash
   npm run api
   ```

3. Em outro terminal, suba a aplicação (fica em `http://localhost:5173`):

   ```bash
   npm run dev
   ```

A aplicação só mostra dados com a API rodando. Para voltar aos dados de exemplo, copie o `db.seed.json` por cima do `db.json`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe a aplicação em modo de desenvolvimento |
| `npm run api` | Sobe a API do json-server na porta 3000 |
| `npm run build` | Confere os tipos e gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão gerada pelo build |
| `npm run lint` | Roda o oxlint no código |

## Telas

| Rota | Tela |
| --- | --- |
| `/` | Lista de tarefas |
| `/tarefas/nova` | Criação de tarefa (`?projeto=<id>` já seleciona o projeto) |
| `/tarefas/:id` | Detalhe da tarefa |
| `/projetos` | Lista de projetos |
| `/projetos/:id` | Página do projeto, com as tarefas dele |
| qualquer outra | Página não encontrada |

## Organização do código

```
src/
├── api.ts            funções que buscam tarefas e projetos na API
├── tipos.ts          contrato de dados (Tarefa, Projeto, Status, Prioridade)
├── formatarData.ts   converte 2026-10-01 em 01/10/2026
├── components/       Layout (cabeçalho e menu) e TarefaCard
└── pages/            uma tela por rota
```

## Como trabalhamos

Cada tarefa é uma [issue](https://github.com/GabaDevPro/G2FrontEnd/issues), agrupada por marco e com um responsável. Cada issue ganha uma branch própria, e o pull request diz o que muda e como testar, com `Closes #N` para fechar a issue no merge.

Os slides de apresentação de cada marco ficam em `apresentacoes/` e abrem direto no navegador.
