# Marco 3: tela de criação de tarefas

**Branch:** `Feature-tela-de-nova-tarefa`
**Autor:** Caio Dias
**Data:** 21/10/2026

## O que se esperava

- Rota `/tarefas/nova`.
- Gravar a tarefa na API e voltar para a lista.
- Quando aberta pela página de um projeto, já vir com ele selecionado.
- `nova` não pode ser lido pelo roteador como um id.

## Commits

| Commit | O que fez |
| --- | --- |
| `4b74460` Feature: tela nova tarefa | Rota, página de criação e links para ela |
| `e3e0045` Estilização da criação de tarefa | Visual do formulário e da página |
| `b244ab8` BugFix: ids vindo como string após a criação das tarefas | Ids das tarefas novas em sequência (6, 7, 8...) |

## 1. Tela de nova tarefa

### Rota `/tarefas/nova` ([src/App.tsx](../../src/App.tsx))

A rota foi declarada como rota fixa ao lado de `/tarefas/:id`:

```tsx
<Route path="/tarefas/nova" element={<NovaTarefa />} />
<Route path="/tarefas/:id" element={<DetalheTarefa />} />
```

O React Router 7 dá preferência a um trecho fixo (`nova`) sobre um trecho dinâmico (`:id`), seja qual for a ordem das rotas. Por isso `nova` nunca chega no `DetalheTarefa` como id. Foi testado com o `matchRoutes`, colocando de propósito o `:id` primeiro:

| URL | Tela que abre |
| --- | --- |
| `/tarefas/nova` | Nova tarefa (sem parâmetro) |
| `/tarefas/3` | Detalhe da tarefa, com `id: "3"` |

### Página ([src/pages/NovaTarefa.tsx](../../src/pages/NovaTarefa.tsx))

- Usa o `FormularioTarefa`, que o Lucas criou no PR #52.
- Ao salvar, chama `criarTarefa` (POST em `/tarefas`) e volta para onde a pessoa estava: a página do projeto, se veio de lá, ou a lista de tarefas em `/`. Nos dois casos a tarefa nova já aparece na lista da tela.
- Se a gravação falhar, o formulário mostra a mensagem de erro e a tela não muda.

### Projeto já selecionado

- A página do projeto ([src/pages/DetalheProjeto.tsx](../../src/pages/DetalheProjeto.tsx)) ganhou um link "Nova tarefa" que abre `/tarefas/nova?projeto=<id>`.
- A página de criação lê o `?projeto=` com `useSearchParams` e passa esse id como valor inicial do formulário.

### Outros ajustes

- A lista de tarefas ([src/pages/ListaTarefas.tsx](../../src/pages/ListaTarefas.tsx)) ganhou um link "Nova tarefa".
- A rota nova entrou na tabela de telas do [README.md](../../README.md).

## 2. Estilização

O visual segue as cores, bordas e cantos que o app já usava (variáveis do `index.css`). Funciona no tema claro e no escuro.

### Página

- Link "← Voltar" no topo. Ele leva para o projeto quando a tela foi aberta por um projeto, e para a lista de tarefas nos outros casos.
- Título "Nova tarefa" e um subtítulo explicando que os campos com `*` são obrigatórios.

### Formulário ([src/components/FormularioTarefa.tsx](../../src/components/FormularioTarefa.tsx))

- Fica num cartão com borda e sombra.
- Os campos têm rótulos claros, textos de exemplo e um destaque roxo quando estão selecionados.
- Status e Prioridade ficam lado a lado, e Responsável e Prazo também.
- A prioridade virou três botões (Baixa, Média e Alta), cada um com uma bolinha verde, amarela ou vermelha, no lugar da lista de seleção.
- Botão "Salvar tarefa" em roxo e um novo "Cancelar", que volta para a tela de onde a pessoa veio.
- Os erros aparecem numa caixa vermelha.
- No celular (abaixo de 600px), os campos ficam um embaixo do outro e os botões ocupam a largura toda.

Os estilos ficaram em [src/App.css](../../src/App.css). As cores de erro, nas versões clara e escura, ficaram em [src/index.css](../../src/index.css).

### O que mudou no `FormularioTarefa` do Lucas

A lógica dele continua igual: os estados, a busca dos projetos, o envio e as regras que desabilitam o botão. As mudanças foram estas:

1. Saiu o título "Formulário de tarefa", porque a página já tem o seu.
2. O Título passou a ser obrigatório. Antes dava para salvar uma tarefa sem nome.
3. A Prioridade virou três botões em vez de um `<select>`. O valor salvo continua `baixa`, `media` ou `alta`.
4. Nova prop opcional `aoCancelar`, que mostra o botão "Cancelar". Sem ela, o formulário funciona como antes.
5. O aviso "Carregando projetos..." passou a aparecer dentro do próprio select.
6. Entraram classes CSS, textos de exemplo e o `*` nos campos obrigatórios.

## 3. Correção: ids aleatórios

### O problema

Ao criar uma tarefa, ela vinha com um id em caracteres aleatórios (ex.: `"PxMUGkBGz4I"`), e não com o próximo número.

### A causa

O json-server 1.0 (beta), que o projeto usa, sempre gera um id aleatório no cadastro, mesmo quando o front manda um id. Por isso não dava para resolver só no React.

### A solução ([servidor-api.js](../../servidor-api.js))

- Um arquivo pequeno que sobe o mesmo json-server, trocando só a geração do id: o novo id é o maior id existente + 1.
- O resto da API (listagem, `_embed`, PATCH etc.) continua igual.
- Os projetos novos também passam a receber id em sequência.
- O script `npm run api` do [package.json](../../package.json) agora roda `node servidor-api.js db.json --port 3000`. O comando que a equipe usa continua o mesmo.

O id é o sucessor da última tarefa de todas, e não do projeto. Ele precisa ser único entre todas as tarefas, porque é ele que a rota `/tarefas/:id` usa. Pela regra "por projeto", a próxima tarefa do projeto 1 seria a 5, mas a 5 já existe no projeto 2.

### Teste (feito numa cópia do `db.json`)

| Ação | Resultado |
| --- | --- |
| Criar uma tarefa no projeto 1 | id `"6"` |
| Criar uma tarefa no projeto 2 | id `"7"` |
| Abrir `/tarefas/7` | Abre a tarefa |
| Abrir o projeto 2 com `?_embed=tarefas` | Lista as tarefas `5` e `7` |
| Criar um projeto | id `"3"` |

> Depois de atualizar o código, é preciso parar a API (Ctrl+C) e rodar `npm run api` de novo. Uma API que já estava aberta continua usando o json-server antigo.

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`.
3. Em outro terminal, rode `npm run dev`.
4. Abra um projeto e clique em "Nova tarefa". O projeto já deve vir selecionado.
5. Preencha, salve e confira que a tarefa aparece na lista com o próximo id em número.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/pages/NovaTarefa.tsx` | Novo: página de criação |
| `servidor-api.js` | Novo: json-server com ids em sequência |
| `src/App.tsx` | Rota `/tarefas/nova` |
| `src/components/FormularioTarefa.tsx` | Visual, prioridade em botões, botão Cancelar e Título obrigatório |
| `src/App.css` | Estilos da página e do formulário |
| `src/index.css` | Cores de erro (tema claro e escuro) |
| `src/pages/DetalheProjeto.tsx` | Link "Nova tarefa" com o projeto selecionado |
| `src/pages/ListaTarefas.tsx` | Link "Nova tarefa" |
| `package.json` | Script `api` usa o `servidor-api.js` |
| `README.md` | Rota nova na tabela de telas |
