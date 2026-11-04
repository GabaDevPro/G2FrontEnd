# Marco 5: mostrar o estado de erro

**Branch:** `feature/marco5-issues-33-34`
**Autor:** GabaDevPro
**Data:** 04/11/2026
**Issue:** 33 (#36)

## O que se esperava

Mensagem clara quando a API falha (por exemplo, json-server parado) e opção de tentar de novo.

## Commits

| Commit | O que fez |
| --- | --- |
| `73a48cb` | Componente `MensagemErro` e botão "Tentar de novo" na lista de tarefas |
| `fa9965f` | O mesmo botão no quadro, na lista de projetos, nos detalhes, nas edições e na nova tarefa |
| — | Este arquivo |

## Como ficou

- Com a API fora do ar, as telas mostram o que aconteceu e o que conferir: "Não foi possível carregar as tarefas. Verifique se a API está rodando."
- Logo abaixo da mensagem há um botão **Tentar de novo**. Ao clicar, a mensagem some, aparece "Carregando..." e a tela busca os dados outra vez, sem recarregar a página.
- Se a API voltou, o conteúdo aparece. Se ainda está fora, a mensagem volta.
- Vale para 8 telas: lista de tarefas, quadro, lista de projetos, detalhe da tarefa, detalhe do projeto, edição de tarefa, edição de projeto e nova tarefa (quando vem de um projeto).
- Antes, as listas só diziam "Não foi possível carregar as tarefas." e as telas de detalhe diziam "Tente de novo daqui a pouco", sem dar um jeito de tentar de novo.

## 1. O componente ([src/components/MensagemErro.tsx](../../src/components/MensagemErro.tsx))

```tsx
interface MensagemErroProps {
  mensagem: string
  aoTentarDeNovo: () => void
}

function MensagemErro({ mensagem, aoTentarDeNovo }: MensagemErroProps) {
  return (
    <div className="alerta" role="alert">
      <p>{mensagem}</p>
      <button type="button" className="botao" onClick={aoTentarDeNovo}>
        Tentar de novo
      </button>
    </div>
  )
}
```

- `mensagem`: cada tela passa o próprio texto.
- `aoTentarDeNovo`: a tela entrega uma função, e o componente só a chama no clique. Ele não sabe *o que* recarregar. É o mesmo padrão do `aoMudarStatus` do `CartaoTarefa`.
- `role="alert"`: o leitor de tela anuncia o erro assim que ele aparece.
- `type="button"`: o botão nunca envia um formulário sem querer.

## 2. Como o "Tentar de novo" funciona

Em cada tela foram três mudanças:

```tsx
// 1. Um contador que só serve de gatilho
const [tentativa, setTentativa] = useState(0)

useEffect(() => {
  async function carregarTarefas() {
    // 2. Antes de buscar, limpa o erro e volta para "Carregando..."
    setCarregando(true)
    setErro(false)
    // ... busca na API, como antes
  }
  carregarTarefas()
}, [tentativa]) // 3. Antes era [], agora roda de novo quando o contador muda

// O botão só soma 1 no contador
<MensagemErro
  mensagem="Não foi possível carregar as tarefas. Verifique se a API está rodando."
  aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
/>
```

O caminho de um clique:

**clique → `setTentativa(+1)` → o `useEffect` roda de novo → `carregando` vira `true` e `erro` vira `false` → busca na API → mostra os dados ou o erro.**

Nas telas de detalhe e edição, o `useEffect` já dependia do `id` da URL e já limpava o estado no começo, então só entrou o contador: `[id, tentativa]`.

O CSS ([src/App.css](../../src/App.css)) ganhou duas regras: `.alerta > p` sem margem (o `<p>` do navegador deixava espaço sobrando dentro da caixa vermelha) e um respiro entre o texto e o botão.

## 3. Onde o React fez diferença nesta issue

Outros frameworks também resolvem esta issue. O que se destacou no React foi resolver **tudo com JavaScript e TypeScript comuns e com o mesmo mecanismo que já carregava as telas**, sem precisar de nenhuma peça nova.

### 3.1. Um componente é só uma função

O `MensagemErro` inteiro tem 17 linhas em um arquivo só: as props são uma `interface` do TypeScript, e o HTML fica no próprio `return`. Não teve decorator, template separado, arquivo de estilo próprio nem registro em módulo. Criar, importar e usar em 8 telas foi rápido justamente porque não há cerimônia nenhuma.

> Comparação: no Angular, um componente é uma classe com `@Component`, um template (inline ou em outro arquivo) e entradas declaradas com `@Input`. No Vue, é um arquivo `.vue` com `<template>` e `<script>` separados e props declaradas com `defineProps`.

### 3.2. Evento é só uma função passada como prop

Para o componente avisar a tela de que o botão foi clicado, bastou uma prop do tipo `() => void`. Não teve sistema de eventos próprio: a tela passa a função e o componente a chama. O TypeScript confere tudo, e esquecer o `aoTentarDeNovo` dá erro de compilação.

> Comparação: no Angular, um filho avisa o pai emitindo um evento (`@Output` com `EventEmitter`, ou `output()`). No Vue, com `defineEmits` e `$emit`. O React não tem essa camada: um "evento" de componente é uma função comum.

### 3.3. O `useEffect` recarrega sem código novo de busca

Esse foi o maior ganho. Nenhuma tela ganhou uma função "recarregar". A busca já estava dentro do `useEffect`, e o React roda o efeito de novo sempre que um valor da lista de dependências muda. Colocar `tentativa` nessa lista transformou o carregamento inicial no próprio "tentar de novo": é o mesmo código, só que disparado por um estado.

Isso é o jeito declarativo do React: em vez de dizer "quando clicar, chame a busca", o código diz "a busca depende de `tentativa`", e o React cuida de quando rodar.

### 3.4. A limpeza do efeito evita respostas fora de ordem

Cada `useEffect` dessas telas já tinha:

```tsx
let ativo = true
// ...
return () => {
  ativo = false
}
```

Quando `tentativa` muda, o React **primeiro** roda essa limpeza do efeito anterior e **depois** roda o novo. Então, se a pessoa clicar duas vezes seguidas em "Tentar de novo", a resposta da primeira busca chega com `ativo = false` e é ignorada: a tela nunca mistura dados de duas buscas. Essa proteção já existia e passou a valer de graça para o novo botão, sem nenhuma linha a mais.

### 3.5. Atualização funcional do estado

`setTentativa((atual) => atual + 1)` recebe o valor **atual** do React, e não o valor que estava na tela quando o botão foi desenhado. Com cliques rápidos, cada clique soma 1 de verdade.

### 3.6. Mostrar ou esconder é só JavaScript

```tsx
{erro && <MensagemErro ... />}
```

e, nas telas de detalhe, um `if (erro === 'falha') return (...)`. Não precisou de diretiva especial: é `&&` e `if`, como em qualquer código JavaScript, e o TypeScript entende os dois.

> Comparação: o Angular usa `@if` (ou `*ngIf`) no template, e o Vue usa `v-if`. Funcionam bem, mas são uma sintaxe à parte do JavaScript.

### 3.7. Composição: o mesmo componente em telas diferentes

Nas listas, o `MensagemErro` aparece no meio da página, abaixo dos filtros. Nos detalhes, ele aparece entre um título e o link de voltar. O componente não precisou mudar para caber nos dois lugares: quem decide o que fica em volta é cada tela.

## Como testar

1. `npm run api` em um terminal e `npm run dev` em outro.
2. Pare o `npm run api` (Ctrl+C).
3. Abra cada tela e confira a mensagem com o botão **Tentar de novo**:

| Tela | Mensagem |
| --- | --- |
| `/` | Não foi possível carregar as tarefas. Verifique se a API está rodando. |
| `/quadro` | Não foi possível carregar as tarefas. Verifique se a API está rodando. |
| `/projetos` | Não foi possível carregar os projetos. Verifique se a API está rodando. |
| `/tarefas/1` e `/tarefas/1/editar` | Não foi possível carregar a tarefa, e "A API não respondeu. Verifique se ela está rodando." |
| `/projetos/1` e `/projetos/1/editar` | Não foi possível carregar o projeto, e "A API não respondeu. Verifique se ela está rodando." |
| `/tarefas/nova?projeto=1` | Não foi possível carregar o projeto, e "A API não respondeu. Verifique se ela está rodando." |

4. Rode o `npm run api` de novo e clique em **Tentar de novo**: o conteúdo deve aparecer sem recarregar a página.
5. Com a API ainda parada, clique em **Tentar de novo**: deve aparecer "Carregando..." e depois a mensagem de erro de novo.

`npm run build` e `npm run lint` passam. O lint mostra só o aviso que já existia no `FiltrosContext.tsx`.
