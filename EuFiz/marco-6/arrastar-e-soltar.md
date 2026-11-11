
# Marco 6 — Issue 46: Arrastar e soltar no quadro

**Responsável:** Lucas Rozendo  
**Branch:** feature/issue-46-drag-drop  
**Issue:** #49

## Objetivo

Implementar a funcionalidade de arrastar e soltar tarefas entre as colunas do quadro Kanban.

## Implementação

Foi utilizada a API nativa de Drag and Drop do navegador, sem necessidade de instalar bibliotecas externas.

No componente `Quadro.tsx`, foram adicionados:

- `draggable`: permite arrastar os cartões.
- `onDragStart`: identifica a tarefa arrastada.
- `onDragOver`: permite que a coluna receba a tarefa.
- `onDrop`: identifica a coluna de destino.
- `onDragEnd`: limpa os estados do arraste.

Ao soltar uma tarefa em outra coluna, a função `atualizarTarefa()` realiza uma requisição PATCH para atualizar o status na API.

Após a confirmação da API, o React atualiza o estado das tarefas utilizando `setTarefas()`, fazendo o cartão aparecer na nova coluna.

## Acessibilidade

O seletor de status original foi mantido para permitir alterações por teclado.

Também foi preservada a região com `role="status"`, utilizada para anunciar alterações e erros aos leitores de tela.

## Interface

Foi adicionado destaque visual à coluna de destino durante o arraste e alterado o cursor dos cartões para indicar que são arrastáveis.

## Testes

- Build de produção executado sem erros.
- Movimentação de tarefas entre colunas funcionando.
- Atualização de status integrada à API.
- Seletor de status original preservado.

## Resultado

O quadro Kanban passou a permitir a movimentação de tarefas por arrastar e soltar, sem remover as funcionalidades existentes.
