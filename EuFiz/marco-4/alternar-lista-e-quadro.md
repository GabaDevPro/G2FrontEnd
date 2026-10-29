# Marco 4: alternar entre lista e quadro

**Branch:** `feature/alternar-lista-quadro`
**Autor:** Ricardo Real
**Data:** 28/10/2026
**Issue:** 28 (#31)

## O que se esperava

Navegação entre as duas visões, mantendo busca e filtros aplicados.

## Como ficou

- A lista de tarefas e o quadro ganharam um alternador **Lista | Quadro**, logo abaixo do título e acima da busca.
- Ao trocar de visão, a busca e os filtros continuam preenchidos e aplicados.
- A lista e o quadro passaram a filtrar com a mesma função, então mostram sempre as mesmas tarefas.
- Quem troca de visão pelo teclado continua no alternador, sem voltar para o começo da página.

## 1. O alternador ([src/components/AlternarVisao.tsx](../../src/components/AlternarVisao.tsx))

```tsx
<nav className="alternar-visao" aria-label="Visão das tarefas">
  {visoes.map(({ caminho, rotulo, Icone }) => {
    const atual = matchPath(caminho, pathname) !== null

    return (
      <Link
        key={caminho}
        to={caminho}
        state={{ alternouVisao: true }}
        ref={atual ? linkAtual : undefined}
        aria-current={atual ? 'page' : undefined}
      >
        <Icone />
        {rotulo}
      </Link>
    )
  })}
</nav>
```

- São **links**, e não botões, porque cada visão tem a sua rota: `/` e `/quadro`. Dá para abrir em outra aba, e o voltar do navegador funciona.
- A visão atual leva `aria-current="page"`, como o menu do topo. O leitor de tela ouve "Quadro, página atual".
- A visão atual é achada com o `matchPath` do React Router, a mesma comparação que as rotas fazem. Com `pathname === caminho`, `/quadro/` (barra no fim) e `/Quadro` abriam o quadro, mas nenhuma opção ficava marcada.
- O `nav` tem o nome "Visão das tarefas", para não ser confundido com a navegação principal.
- Os ícones são só de enfeite (`aria-hidden="true"`): o texto do link já diz qual é a visão.

## 2. Busca e filtros continuam aplicados

O alternador não precisa passar nada para a outra tela. Desde a issue 26 (#29), a busca e os filtros ficam no `FiltrosContext`, e o `FiltrosProvider` envolve as rotas no [src/App.tsx](../../src/App.tsx):

```tsx
<FiltrosProvider>
  <Routes>...</Routes>
</FiltrosProvider>
```

Ao trocar de rota, o React desmonta a lista e monta o quadro, mas o provider fica de fora, então o estado não se perde. As duas telas leem os mesmos valores com `useFiltros()`.

## 3. Uma função de filtro para as duas visões ([src/filtrarTarefas.ts](../../src/filtrarTarefas.ts))

**O problema:** a lista e o quadro tinham cada um a sua cópia do filtro, e as cópias já estavam diferentes. A correção de tarefa sem título (PR #64) entrou só na lista. Com uma tarefa de `titulo: null` (por exemplo, depois de editar o `db.json` à mão), a lista funcionava, mas o quadro quebrava inteiro:

```
Cannot read properties of null (reading 'toLowerCase')
```

Ou seja: a mesma busca podia funcionar numa visão e derrubar a outra.

**A solução:** o filtro saiu das páginas e foi para uma função só, que as duas usam.

```ts
export function filtrarTarefas<T extends Tarefa>(
  tarefas: T[],
  { busca, status, prioridade }: Filtros,
): T[] {
  const termo = busca.trim().toLowerCase()

  return tarefas.filter((tarefa) => {
    // Tarefa sem título (db.json editado à mão) conta como título vazio
    const correspondeBusca = (tarefa.titulo ?? '').toLowerCase().includes(termo)
    const correspondeStatus = !status || tarefa.status === status
    const correspondePrioridade =
      !prioridade || tarefa.prioridade === prioridade

    return correspondeBusca && correspondeStatus && correspondePrioridade
  })
}
```

```tsx
// Em ListaTarefas.tsx e em Quadro.tsx
const tarefasFiltradas = filtrarTarefas(tarefas, { busca, status, prioridade })
```

As regras são as mesmas de antes (as do Lucas na issue 25 e as do Gabriel na correção da busca). Só mudou o lugar onde elas ficam. O `<T extends Tarefa>` faz a função devolver o mesmo tipo que recebeu: a lista e o quadro passam `TarefaComProjeto[]` e recebem `TarefaComProjeto[]`, com o projeto junto.

## 4. O foco acompanha a troca de visão

**O problema:** cada tela tem o seu próprio alternador. Ao trocar de visão, o React apaga a tela antiga, e o link em que a pessoa apertou Enter some junto. O foco vai para o começo da página, e quem usa teclado ou leitor de tela perde o lugar.

**A solução:** o link manda um recado para a próxima tela pelo `state` da navegação, e o alternador da tela nova devolve o foco para o link da visão atual:

```tsx
<Link to={caminho} state={{ alternouVisao: true }} ...>
```

```tsx
const { pathname, state } = useLocation()
const tipoNavegacao = useNavigationType()
const linkAtual = useRef<HTMLAnchorElement>(null)

useEffect(() => {
  if (tipoNavegacao === NavigationType.Push && state?.alternouVisao) {
    linkAtual.current?.focus()
  }
}, [tipoNavegacao, state])
```

O navegador guarda o `state` no histórico, então ele continua lá depois de um F5 ou do botão voltar. Por isso o efeito confere também o tipo da navegação: só um clique no link é `PUSH`. O F5 e o voltar são `POP` e não mexem no foco.

Com o mouse a troca também põe o foco no link, mas sem o contorno: o `:focus-visible` só aparece para quem chegou pelo teclado.

## 5. Estilos ([src/App.css](../../src/App.css))

- As duas opções ficam juntas dentro de uma borda, como um controle segmentado.
- A visão atual segue o padrão das pílulas de prioridade do formulário: borda e fundo roxos, com o texto escuro e o ícone roxo. Texto escuro sobre o fundo roxo-claro tem bem mais contraste que texto roxo.
- Passar o mouse destaca a outra opção, e o foco pelo teclado ganha o contorno roxo dos outros botões.
- No celular (até 480px) o alternador ocupa a largura toda, e cada opção fica com 45px de altura, uma área de toque confortável.
- No alto contraste do Windows (`forced-colors`), o navegador troca as cores do site pelas do sistema, e as duas opções ficariam com a mesma borda. A visão atual passa a usar as cores de item selecionado do sistema (`Highlight` e `HighlightText`), com `forced-color-adjust: none` para o texto não sumir atrás da placa escura que o navegador desenha atrás das letras.
- Funciona no tema claro e no escuro.

## Testes

| Teste | Resultado |
| --- | --- |
| `npm run build` e `npm run lint` | Passaram sem erros. O lint mostra só o aviso que já existia no `FiltrosContext.tsx` |
| Na lista, buscar "ar" com prioridade Média e ir para o quadro pelo alternador | Busca e filtro continuam preenchidos. Quadro com "Listar as tarefas na tela" em A fazer e "Montar o quadro no GitHub Projects" em Em revisão |
| Voltar para a lista pelo alternador | "2 tarefas encontradas", com os mesmos dois cartões |
| Teclado: Tab até o alternador e Enter | A tela troca e o foco fica no link da visão nova, com o contorno e marcado como página atual |
| Clique com o mouse no alternador | A tela troca e o foco fica no link, sem o contorno |
| F5 e botão voltar do navegador | O foco não é movido |
| Tarefa com `titulo: null` (numa cópia do `db.json`) | Antes: o filtro do quadro dava o erro acima. Depois: o quadro mostra os 5 cartões, sem erro no console |
| Celular, 375px | Alternador na largura toda, opções de 45px de altura, sem rolagem para o lado |
| URL com barra no fim ou maiúscula (`/quadro/`, `/Quadro`) | Antes: o quadro abria sem nenhuma opção marcada. Depois: Quadro aparece como visão atual |
| Alto contraste do Windows (`forced-colors` emulado no Chrome) | Antes: as duas opções com a mesma borda, sem destaque. Depois: a visão atual com o fundo de item selecionado do sistema e o contorno de foco visível |
| Posição do alternador nas duas visões (1280, 1024, 800, 600 e 480px) | A mesma nas duas, então dá para ir e voltar sem procurar o botão. Em 390px o do quadro fica 24px abaixo, porque a descrição do quadro quebra em duas linhas |

> Os testes que gravam na API foram feitos numa cópia do `db.json`, para não alterar os dados reais.

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`.
3. Em outro terminal, rode `npm run dev`.
4. **Filtros mantidos:** na lista de tarefas, digite "ar" na busca e escolha a prioridade Média. Devem aparecer 2 tarefas.
5. Clique em **Quadro** no alternador. A busca e a prioridade devem continuar preenchidas, e o quadro deve mostrar só as mesmas 2 tarefas, nas colunas A fazer e Em revisão.
6. Clique em **Lista** e confira as mesmas 2 tarefas.
7. **Teclado:** chegue no alternador com Tab e aperte Enter. A visão troca e o foco continua no alternador, já no link da visão nova. Aperte Tab e Enter de novo para voltar.
8. **Celular:** no DevTools, use a largura de 375px. O alternador deve ocupar a largura toda, sem rolagem para o lado.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/components/AlternarVisao.tsx` | Novo: o alternador Lista \| Quadro, com o foco acompanhando a troca |
| `src/filtrarTarefas.ts` | Novo: a busca e os filtros que a lista e o quadro aplicam |
| `src/pages/ListaTarefas.tsx` | Alternador abaixo do título e filtro pelo `filtrarTarefas` |
| `src/pages/Quadro.tsx` | Alternador abaixo do título e filtro pelo `filtrarTarefas` |
| `src/App.css` | Estilos do alternador |
| `README.md` | O alternador na tabela de telas e os arquivos novos na organização do código |
| `EuFiz/marco-4/alternar-lista-e-quadro.md` | Novo: este arquivo |
