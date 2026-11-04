# Marco 5: mostrar o estado vazio

**Branch:** `feature/marco5-issues-33-34`
**Autor:** GabaDevPro
**Data:** 04/11/2026
**Issue:** 34 (#37)

## O que se esperava

Mensagem quando não há tarefas, quando o projeto não tem tarefas ou quando busca e filtros não encontram nada.

## Commits

| Commit | O que fez |
| --- | --- |
| `69b2ab0` | As frases de "nenhuma tarefa" da lista vão para uma função compartilhada, `descreverResultado` |
| `ac96bca` | O quadro usa essa função e avisa quando não há nenhuma tarefa para mostrar |
| — | Este arquivo |

## O que já existia e o que faltava

| Caso da issue | Lista de tarefas | Quadro | Página do projeto |
| --- | --- | --- | --- |
| Não há tarefas | Já dizia "Nenhuma tarefa cadastrada." | **Faltava:** cada coluna dizia só "Nenhuma tarefa" | — |
| O projeto não tem tarefas | — | — | Já dizia "Este projeto ainda não tem tarefas." |
| Busca e filtros não acham nada | Já dizia "Nenhuma tarefa com "x" no título." e "Nenhuma tarefa corresponde aos filtros." | **Faltava:** as colunas ficavam vazias, sem explicar por quê | — |

Então o trabalho foi no **quadro**. Com as colunas todas em "Nenhuma tarefa", não dava para saber se não existia tarefa nenhuma ou se a busca e os filtros tinham escondido tudo.

## Como ficou

Acima das colunas do quadro aparece a mesma frase que a lista mostra:

- Nenhuma tarefa no sistema: "Nenhuma tarefa cadastrada."
- Busca sem resultado: "Nenhuma tarefa com "zzzz" no título."
- Busca e filtro sem resultado: "Nenhuma tarefa com "x" no título que corresponda aos filtros."
- Só filtro sem resultado: "Nenhuma tarefa corresponde aos filtros."
- Com tarefas na tela, não aparece frase nenhuma, e o quadro fica como antes.

As colunas continuam aparecendo, e a lista continua com as mesmas frases de antes.

## 1. Uma função para as frases ([src/filtrarTarefas.ts](../../src/filtrarTarefas.ts))

As frases estavam escritas dentro da `ListaTarefas.tsx`. Para o quadro não copiar o mesmo bloco de `if`, elas foram para uma função:

```ts
export function descreverResultado(total: number, { busca, status, prioridade }: Filtros): string {
  const termo = busca.trim()
  const filtrando = status !== '' || prioridade !== ''

  if (total === 0 && termo) return `Nenhuma tarefa com "${termo}" no título...`
  if (total === 0 && filtrando) return 'Nenhuma tarefa corresponde aos filtros.'
  if (total === 0) return 'Nenhuma tarefa cadastrada.'
  if (termo || filtrando) return `${total} tarefas encontradas`
  return ''
}
```

Ela fica ao lado do `filtrarTarefas`, que já era a função usada pela lista e pelo quadro para decidir **quais** tarefas aparecem. Agora as duas visões também usam a mesma função para dizer **o que** aconteceu. Ao alternar entre lista e quadro, a frase é a mesma.

Na lista, o bloco de `if` virou uma chamada:

```tsx
resultadoBusca = descreverResultado(total, { busca, status, prioridade })
```

## 2. O quadro ([src/pages/Quadro.tsx](../../src/pages/Quadro.tsx))

```tsx
const total = tarefasFiltradas.length

const mensagemVazio =
  !carregando && !erro && total === 0
    ? descreverResultado(total, { busca, status, prioridade })
    : ''
```

- Só há frase quando **não sobrou nenhuma tarefa**. No quadro, a contagem por coluna já existe, então "3 tarefas encontradas" não foi colocado: a issue pede só o estado vazio.
- Carregando ou com erro, não há frase. Sem isso, com algo digitado na busca, o quadro diria "Nenhuma tarefa com..." antes de a API responder, ou junto com a mensagem de erro.

A frase aparece em um parágrafo com `role="status"`, igual ao da lista:

```tsx
{carregando ? (
  <Carregando mensagem="Carregando quadro..." />
) : (
  <p role="status" className="resultado-busca">
    {mensagemVazio}
  </p>
)}
```

O `role="status"` faz o leitor de tela anunciar a frase quando ela muda. Por exemplo, ao digitar uma busca que esvazia o quadro, quem não enxerga a tela ouve "Nenhuma tarefa com ... no título".

## 3. Onde o React fez diferença nesta issue

### 3.1. A tela é calculada a partir do estado

Nada nesta issue "liga" ou "desliga" a mensagem na mão. A frase é **calculada** a cada renderização a partir de `tarefas`, `busca`, `status` e `prioridade`:

```
estado (tarefas + filtros) → filtrarTarefas → total → descreverResultado → frase na tela
```

Quando a pessoa digita na busca, o React renderiza o quadro de novo, a conta é refeita e a frase certa aparece sozinha. Não existe código do tipo "quando digitar, procure o parágrafo e troque o texto". Esse é o centro do React: **a interface é uma função do estado**.

> Comparação: sem um framework, seria preciso escutar o `input`, refiltrar, procurar o elemento no DOM e trocar o `textContent` em cada mudança, nos dois lugares (lista e quadro). Angular e Vue também recalculam sozinhos, com `computed`, mas declarando a dependência em uma API própria do framework. No React é uma variável comum dentro da função.

### 3.2. Lógica de tela em função comum, fora do componente

`descreverResultado` não é um componente nem um hook: é uma função TypeScript comum, que recebe números e textos e devolve um texto. Ela não depende do React, e por isso a lista e o quadro podem usá-la sem nenhuma ligação especial entre eles. O mesmo vale para o `filtrarTarefas`, que já existia.

> Comparação: no Angular, o caminho comum para dividir lógica entre telas é um *service* com `@Injectable` e injeção de dependência, ou um *pipe*. No React, como os componentes são funções, uma função qualquer já serve.

### 3.3. O estado compartilhado já fazia a lista e o quadro concordarem

A busca e os filtros ficam no `FiltrosContext`, que outra issue já tinha criado. O quadro lê esses valores com `useFiltros()` e só precisou passá-los para `descreverResultado`. Ao trocar de visão, a busca continua digitada e a frase continua a mesma, sem nenhum código novo para isso.

### 3.4. Renderização condicional com expressões simples

A decisão de mostrar ou não a frase é um operador ternário (`condição ? frase : ''`). O parágrafo com `role="status"` fica sempre na página depois do carregamento, e só o texto dentro dele muda. Isso é importante para o leitor de tela: ele anuncia uma mudança de texto em uma região que já existe.

## Como testar

1. `npm run api` em um terminal e `npm run dev` em outro.
2. **Busca sem resultado:** no `/quadro`, digite `zzzz` na busca. Deve aparecer "Nenhuma tarefa com "zzzz" no título."
3. **Busca e filtro:** digite o título de uma tarefa e escolha um status que ela não tem. Deve aparecer "... que corresponda aos filtros."
4. **Com tarefas:** apague a busca e volte o filtro para "Todos". Não deve aparecer frase nenhuma.
5. **Lista igual a antes:** em `/`, os mesmos passos devem mostrar as mesmas frases. Com uma busca que acha algo, deve aparecer "1 tarefa encontrada", como antes.
6. **Sem nenhuma tarefa:** pare a API e rode-a em uma cópia do `db.json` com `"tarefas": []`. A lista e o quadro devem dizer "Nenhuma tarefa cadastrada.", e `/projetos/1` deve dizer "Este projeto ainda não tem tarefas."

Esses passos foram feitos em um navegador controlado por script (Playwright com o Chrome), junto com os testes da issue 33, e todos passaram. O teste usou cópias do `db.json`, e o arquivo original não foi alterado.

`npm run build` e `npm run lint` passam. O lint mostra só o aviso que já existia no `FiltrosContext.tsx`.
