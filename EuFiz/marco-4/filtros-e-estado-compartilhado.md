# Marco 4 — Filtros e estado compartilhado

**Autor:** Lucas Rozendo  
**Branch:** `feature/marco4-issues-25-26`  
**Data:** 28/10/2026  
**Issues:** 25 (#28) e 26 (#29)

## O que se esperava

### Issue 25 — Implementar filtros por status e prioridade
- Criar seletores de status e prioridade.
- Permitir combinar os dois filtros.
- Integrar os filtros à busca por título.

### Issue 26 — Centralizar o estado de busca e filtros
- Armazenar busca, status e prioridade em um único lugar.
- Compartilhar os filtros entre a Lista e o Quadro.
- Manter os valores selecionados durante a navegação.

## 1. Implementação dos filtros

Criamos o componente `FiltrosTarefas.tsx`, responsável por exibir os seletores de status e prioridade.

Reaproveitamos os tipos `Status` e `Prioridade` do arquivo `tipos.ts`, além dos rótulos existentes em `rotulos.ts`.

Inicialmente, os valores eram armazenados com `useState` e enviados para a página por meio da prop `aoFiltrar`.

Na página `ListaTarefas.tsx`, utilizamos o método `filter()` para exibir somente as tarefas que atendiam às condições selecionadas.

Posteriormente, integramos nossos filtros à busca por título implementada por outro integrante na Issue 24.

A filtragem utiliza três condições combinadas com o operador lógico `&&`: busca por título, status e prioridade.

Quando um filtro está vazio, ele não restringe os resultados. A busca também ignora diferenças entre letras maiúsculas e minúsculas.

## 2. Centralização do estado com Context API

Criamos `FiltrosContext.tsx` utilizando recursos do React:

- `createContext`: cria o contexto compartilhado.
- `useState`: armazena busca, status e prioridade.
- `useContext`: permite acessar os dados compartilhados.
- `FiltrosProvider`: disponibiliza os estados aos componentes.
- `useFiltros`: hook personalizado que simplifica o acesso ao contexto.

O `FiltrosProvider` foi adicionado ao `App.tsx`, envolvendo as rotas da aplicação.

Assim, Lista e Quadro utilizam os mesmos valores, sem precisar repassar informações por props entre vários componentes.

Também removemos os estados locais duplicados e a prop `aoFiltrar`, que deixou de ser necessária.

## 3. Componentes reutilizáveis

### FiltrosTarefas.tsx

Exibe dois seletores controlados. Seus valores e funções de atualização são obtidos diretamente de `useFiltros()`.

### BuscaTarefas.tsx

Reaproveita a interface de pesquisa por título desenvolvida na Issue 24.

O componente utiliza o estado `busca` do contexto, permitindo pesquisar tanto na Lista quanto no Quadro.

## 4. Integração entre Lista e Quadro

Em `ListaTarefas.tsx`, a listagem utiliza os três critérios de filtragem antes de renderizar os cartões.

Em `Quadro.tsx`, as tarefas são filtradas pelos mesmos critérios antes de serem distribuídas pelas colunas de status.

Dessa forma, ao selecionar um filtro na Lista e navegar para o Quadro, os valores permanecem aplicados.

Preservamos a funcionalidade de mudança de status dos cartões, implementada anteriormente por outro integrante.

## 5. Dificuldades e soluções

**Integração com a busca por título:** a Issue 24 foi desenvolvida paralelamente por outro integrante. Ao atualizar nossa branch com a `main`, ocorreu um conflito em `ListaTarefas.tsx`, pois ambos modificamos o mesmo arquivo.

O conflito foi resolvido preservando a busca existente e acrescentando nossos filtros combinados.

**Estados duplicados:** inicialmente, a página e o componente de filtros mantinham valores separados. A Context API permitiu centralizar esses estados e eliminar a comunicação desnecessária por props.

**Reutilização entre páginas:** para evitar duplicação de código, criamos componentes compartilhados de busca e filtros, utilizados tanto na Lista quanto no Quadro.

## 6. Testes

| Teste | Resultado |
|---|---|
| Filtrar por status | Funcionando |
| Filtrar por prioridade | Funcionando |
| Combinar status e prioridade | Funcionando |
| Combinar filtros com busca por título | Funcionando |
| Compilação com `npm run build` | Sem erros |
| Verificação com `npm run lint` | 0 erros, 1 aviso não bloqueante |

O aviso do lint refere-se à exportação conjunta do Provider e do hook no mesmo arquivo. Ele não impede a compilação.

## 7. Como testar

1. Executar `npm install`, se necessário.
2. Iniciar a API com `npm run api`.
3. Iniciar o React com `npm run dev`.
4. Abrir a página inicial de tarefas.
5. Selecionar um status e uma prioridade.
6. Digitar parte do título de uma tarefa.
7. Navegar para o Quadro e verificar se os filtros permanecem aplicados.
8. Alterar os filtros e retornar à Lista para conferir o estado compartilhado.

## 8. Arquivos criados e modificados

| Arquivo | Modificação |
|---|---|
| `src/components/FiltrosTarefas.tsx` | Componente reutilizável de filtros |
| `src/components/BuscaTarefas.tsx` | Componente reutilizável de busca |
| `src/context/FiltrosContext.tsx` | Estado compartilhado com Context API |
| `src/pages/ListaTarefas.tsx` | Integração de busca e filtros |
| `src/pages/Quadro.tsx` | Integração dos filtros compartilhados |
| `src/App.tsx` | Inclusão do FiltrosProvider |

## Conclusão

As Issues 25 e 26 foram implementadas utilizando componentes reutilizáveis, hooks e Context API do React.

A solução permite combinar busca, status e prioridade e compartilhar os valores entre Lista e Quadro, reduzindo duplicação de código e facilitando futuras modificações.