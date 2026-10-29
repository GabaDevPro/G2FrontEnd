# Marco 4: revisão de bugs

**Branch:** `fix/revisao-marco-4`
**Autor:** Caio Dias
**Data:** 29/10/2026

## O que se esperava

Revisar o código depois das issues do Marco 4 (busca, filtros, estado compartilhado, mudar o status pelo cartão e alternar entre lista e quadro). Corrigir os bugs que vieram com essas novidades e os que já tinham sido corrigidos em uma tela, mas não nas outras. Sem adiantar nenhuma issue nova.

## Commits

Um commit por bug, para dar para conferir (ou desfazer) cada correção sozinha.

| Commit | O que fez |
| --- | --- |
| `77fa193` | Menu do topo marca Quadro em `/quadro/` e `/Quadro` |
| `6e8ade0` | Prioridade ausente não derruba a lista e o quadro |
| `66d69ea` | Lista não diz "Nenhuma tarefa" antes de carregar |
| `e811e88` | Listas avisam quando a API não responde |
| `bab698d` | Lista avisa quando os filtros não encontram tarefas |
| `32483c9` | Foco não se perde quando o cartão sai pelo filtro de status |
| `1ef2a9f` | Leitor de tela anuncia de novo o mesmo aviso de status |
| `1aa9e48` | Tarefa com status desconhecido aparece no quadro |
| `be1d14d` | Detalhes ignoram a resposta de um id anterior |
| `cc9211f` | Edição de tarefa inexistente volta para o quadro quando veio de lá |

## Bugs que vieram com o Marco 4

### 1. O cartão some e o foco se perde ao mudar o status com filtro ativo

**O problema:** o seletor de status no cartão (issue 29) e o filtro de status (issue 25) foram feitos em paralelo. Com o filtro "Em andamento" ligado, trocar uma tarefa para "A fazer" esconde o cartão na hora. No quadro, o foco caía no começo da página (justamente o que o `flushSync` existia para evitar). Na lista, o cartão sumia sem nenhum aviso.

**A solução** ([src/pages/Quadro.tsx](../../src/pages/Quadro.tsx) e [src/pages/ListaTarefas.tsx](../../src/pages/ListaTarefas.tsx)): depois do `flushSync`, a página confere se o seletor do cartão ainda existe. Se não existe, o foco vai para o filtro de status (que foi quem escondeu a tarefa), e o leitor de tela ouve o motivo.

```tsx
const seletor = document.getElementById(`status-${tarefa.id}`)

if (seletor) {
  seletor.focus()
  anunciar(`${mudanca}.`)
} else {
  document.getElementById('filtro-status')?.focus()
  anunciar(`${mudanca} e não aparece com os filtros atuais.`)
}
```

### 2. A lista diz "Nenhuma tarefa" enquanto carrega

**O problema:** antes da issue 26 a busca começava vazia em toda visita. Agora ela fica no `FiltrosContext`. Quem digitava "ar" no quadro e trocava para a lista via `Nenhuma tarefa com "ar"…` até a API responder, e o leitor de tela anunciava isso, porque a mensagem fica num `role="status"`.

**A solução** ([src/pages/ListaTarefas.tsx](../../src/pages/ListaTarefas.tsx)): a lista ganhou o estado `carregando`, como o quadro já tinha, e mostra "Carregando tarefas..." nesse tempo.

### 3. Filtros sem resultado deixam a página em branco

**O problema:** só a busca por título gerava mensagem. Com status "Concluída" e prioridade "Baixa" e a busca vazia, a página ficava em branco e nada era anunciado. E o texto "…que corresponda aos filtros" aparecia mesmo sem nenhum filtro escolhido.

**A solução:** as mensagens passaram a considerar os filtros também.

| Situação | Mensagem |
| --- | --- |
| Busca sem resultado, sem filtro | `Nenhuma tarefa com "zzz" no título.` |
| Busca sem resultado, com filtro | `Nenhuma tarefa com "zzz" no título que corresponda aos filtros.` |
| Só filtros, sem resultado | `Nenhuma tarefa corresponde aos filtros.` |
| Busca ou filtro com resultado | `3 tarefas encontradas` |

### 4. A lista fica em branco com a API fora do ar

**O problema:** a lista de tarefas e a de projetos não tinham `try/catch`. Com a API desligada, a página ficava vazia, com uma promise rejeitada no console. Com algo digitado, a lista ainda dizia "Nenhuma tarefa com…", como se a busca tivesse funcionado.

**A solução** ([src/pages/ListaTarefas.tsx](../../src/pages/ListaTarefas.tsx) e [src/pages/ListaProjetos.tsx](../../src/pages/ListaProjetos.tsx)): o mesmo tratamento do quadro, com o aviso "Não foi possível carregar…" e o `ativo` para ignorar respostas que chegam depois de sair da tela.

### 5. Tarefa com status desconhecido some do quadro

**O problema:** uma tarefa com status fora dos quatro (por exemplo, `db.json` editado à mão) não cabia em nenhuma coluna. Ela sumia do quadro, mas aparecia na lista, e as duas visões deixavam de mostrar as mesmas tarefas.

**A solução:** essas tarefas vão para uma coluna **Sem status**, que só aparece quando existe alguma. O seletor do cartão e o detalhe mostram "Sem status" em vez de "A fazer". No CSS, o quadro trocou `repeat(4, …)` por `grid-auto-flow: column`, para a quinta coluna ficar ao lado das outras em vez de quebrar para baixo.

## Correções antigas que ficaram pela metade

### 6. Menu do topo sem seção marcada em `/quadro/`

O commit `a855cf5` trocou o `===` pelo `matchPath` só no alternador. O menu do topo ([src/components/Layout.tsx](../../src/components/Layout.tsx)) continuava com `pathname === '/quadro'`, e a mesma URL deixava o alternador marcado e o menu sem nada. Agora os dois usam `matchPath`.

### 7. Prioridade ausente derruba a lista e o quadro

É o mesmo caso do título `null` do PR #64, em outro campo: `rotuloPrioridade[tarefa.prioridade].toLowerCase()` dava `Cannot read properties of undefined` e a página ficava em branco. Agora o cartão mostra "Sem prioridade".

### 8. Detalhes sem a proteção contra resposta antiga

O commit `f256d3c` fez as telas de edição ignorarem a resposta de um id anterior. Os detalhes de tarefa e de projeto ficaram de fora e ganharam a mesma proteção (`ativo`).

## Menores

- **9.** A tela "Tarefa não encontrada" da edição sempre voltava para a lista, mesmo vindo do quadro. Agora respeita o `?origem=quadro`, como o detalhe.
- **10.** O `role="status"` só é lido quando o texto muda. Quando o aviso se repetia igual (uma tarefa saindo pelo filtro duas vezes pelo mesmo caminho, ou duas tarefas de mesmo título indo para a mesma coluna), nada era anunciado. Um espaço invisível (`\u00A0`) no fim faz o texto mudar.

## Testes

Feitos com Playwright no Edge, numa cópia do `db.json` com duas tarefas a mais: uma com status `bloqueada` e sem prioridade, e outra com `titulo: null`. O `db.json` real não foi alterado.

| Teste | Resultado |
| --- | --- |
| `npm run build` e `npm run lint` | Passaram. O lint mostra só o aviso que já existia no `FiltrosContext.tsx` |
| Menu do topo em `/quadro/`, `/Quadro` e `/Tarefas/1` | Marca Quadro, Quadro e Tarefas |
| Lista e quadro com a tarefa sem prioridade e de status desconhecido | Abrem sem erro no console. Cartão com "Sem prioridade" e seletor com "Sem status" |
| Quadro com a tarefa de status desconhecido | 5 colunas na mesma linha. As mesmas 7 tarefas da lista |
| Buscar "ar" no quadro e trocar para a lista, com a API lenta | "Carregando tarefas..." e depois "5 tarefas encontradas" |
| API fora do ar | Lista e projetos mostram o aviso de erro. A lista não diz "Nenhuma tarefa" |
| Mensagens da lista (tabela do item 3) | As quatro situações com o texto esperado |
| Quadro e lista: mudar o status sem filtro | O foco continua no seletor do cartão |
| Quadro e lista: mudar o status com o filtro escondendo a tarefa | O foco vai para o filtro de status, e o aviso explica |
| Lista: a mesma tarefa sai pelo filtro duas vezes | O segundo aviso muda (termina com `\u00A0`) |
| `/tarefas/999/editar?origem=quadro` | "Voltar para o quadro", com link para `/quadro` |
| Quadro em 375px | Sem rolagem da página para o lado |

O item 8 não foi testado no navegador: precisaria trocar o id da URL antes da resposta chegar. É o mesmo código das telas de edição.

## Como testar a branch

1. `npm install`
2. Numa cópia do `db.json`, troque o `"status"` de uma tarefa para `"bloqueada"` e apague a linha `"prioridade"` dela.
3. Em um terminal, rode `npm run api`. Em outro, rode `npm run dev`.
4. **Status e prioridade desconhecidos:** a lista abre normalmente, e o quadro mostra a coluna "Sem status".
5. **Filtro e status:** no quadro, escolha o filtro "A fazer" e mude uma tarefa para "Em andamento" pelo teclado. O foco deve ir para o filtro de status.
6. **Mensagens:** na lista, escolha status "Concluída" e prioridade "Baixa". Deve aparecer "Nenhuma tarefa corresponde aos filtros.".
7. **API fora do ar:** pare o `npm run api` e recarregue a lista. Deve aparecer "Não foi possível carregar as tarefas.".
8. **Menu do topo:** abra `/quadro/` (com a barra no fim). "Quadro" deve aparecer marcado no menu.
9. Desfaça a mudança no `db.json`.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/components/Layout.tsx` | Menu do topo com `matchPath` |
| `src/components/CartaoTarefa.tsx` | "Sem prioridade" e "Sem status" no cartão |
| `src/pages/ListaTarefas.tsx` | Carregamento, erro, mensagens dos filtros e foco ao mudar o status |
| `src/pages/ListaProjetos.tsx` | Carregamento e erro |
| `src/pages/Quadro.tsx` | Coluna "Sem status", foco com filtro ativo e aviso repetido |
| `src/pages/DetalheTarefa.tsx` | `ativo`, "Sem status" e "Sem prioridade" |
| `src/pages/DetalheProjeto.tsx` | `ativo` |
| `src/pages/EditarTarefa.tsx` | "Voltar" respeita o `?origem=quadro` |
| `src/App.css` | Quadro com `grid-auto-flow: column` e cor da coluna "Sem status" |
| `EuFiz/marco-4/revisao-de-bugs.md` | Novo: este arquivo |
