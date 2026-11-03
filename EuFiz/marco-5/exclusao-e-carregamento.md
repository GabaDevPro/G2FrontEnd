# Marco 5 — Exclusão de tarefas e estados de carregamento

**Responsável:** Lucas Rozendo  
**Framework:** React + TypeScript  
**Issues:** 31 e 32  
**Branch:** `feature/marco5-issues-31-32`

## 1. Objetivo

O objetivo desta etapa foi implementar a exclusão de tarefas com confirmação e melhorar a experiência do usuário durante o carregamento dos dados da API.

## 2. Issue 31 — Excluir tarefa com confirmação

### Implementação

Foi criada a função `excluirTarefa()` no módulo `src/api.ts`, utilizando o método HTTP `DELETE` para remover uma tarefa do JSON Server.

Na página `DetalheTarefa.tsx`, foi adicionado um botão de exclusão que solicita confirmação ao usuário por meio de `window.confirm()`.

Caso o usuário cancele a operação, nenhuma requisição de exclusão é realizada.

Quando a exclusão é confirmada, a aplicação aguarda a resposta da API e, em caso de sucesso, redireciona o usuário para a lista ou quadro de origem.

Também foi utilizado `useState` para controlar o estado de exclusão, desabilitando o botão durante a operação e permitindo apresentar uma mensagem caso ocorra uma falha.

### Conceitos utilizados

- `fetch()` com método HTTP `DELETE`.
- `async/await` para operações assíncronas.
- `useState` para controlar o estado da exclusão.
- `useNavigate` do React Router para navegação programática.
- Renderização condicional para atualizar o texto e desabilitar o botão.

## 3. Issue 32 — Mostrar o estado de carregando

### Implementação

Foi criado o componente reutilizável `Carregando.tsx`, responsável por apresentar mensagens de carregamento.

As telas do projeto já utilizavam estados locais com `useState` e requisições realizadas por meio de `useEffect`. Portanto, a implementação aproveitou essa estrutura, substituindo as mensagens anteriores pelo componente padronizado.

O componente recebe uma propriedade opcional chamada `mensagem`, permitindo exibir textos como:

- Carregando tarefas...
- Carregando projetos...
- Carregando quadro...

Foram utilizados os atributos `role="status"` e `aria-live="polite"` para melhorar a comunicação do estado de carregamento com tecnologias assistivas.

### Funcionamento

Quando uma tela inicia uma consulta à API, o estado `carregando` permanece verdadeiro.

Durante esse período, a aplicação apresenta o componente `Carregando`.

Após a conclusão da requisição, o estado é alterado para falso, permitindo apresentar os dados recebidos ou a mensagem de erro apropriada.

Como o projeto utiliza uma API local, as requisições normalmente são rápidas, fazendo com que o estado de carregamento seja exibido por um intervalo muito curto.

### Conceitos utilizados

- Componentes reutilizáveis do React.
- Props com TypeScript.
- `useState` para gerenciamento de estado.
- `useEffect` para carregamento de dados.
- Renderização condicional.
- Acessibilidade com ARIA.

## 4. Integração com outras funcionalidades

Durante o desenvolvimento, foram integradas alterações da branch principal, incluindo melhorias no tratamento de tarefas e projetos inexistentes.

O conflito em `DetalheTarefa.tsx` foi resolvido preservando tanto a exclusão de tarefas quanto o tratamento de erros.

## 5. Validação

Foram executados os seguintes comandos:

```bash
npm run build
npm run lint
```

O build foi concluído com sucesso.

O lint apresentou 0 erros e apenas 1 aviso preexistente relacionado ao Fast Refresh no arquivo `FiltrosContext.tsx`.

## 6. Resultado

As implementações atendem aos objetivos das issues 31 e 32 do Marco 5.

O usuário pode solicitar e confirmar a exclusão de uma tarefa, enquanto as telas apresentam uma indicação padronizada durante o carregamento dos dados.

A solução mantém a organização do projeto e aproveita os recursos nativos do React, sem adicionar bibliotecas externas para essas funcionalidades.