# Marco 4: mudar o status pelo cartão

**Branch:** `32-29---mudar-o-status-pelo-cartão`
**Autor:** Caio Dias
**Data:** 26/10/2026

## O que se esperava

- Seletor ou botão no cartão que grava o novo status na API.
- No quadro, o cartão muda de coluna.
- Sem arrastar e soltar.

## Commits

| Commit | O que fez |
| --- | --- |
| `263c752` Feature: mudança de status por seletor | Seletor de status no cartão, gravação na API e o cartão mudando de coluna no quadro |

> Este branch foi criado a partir do `Feature-quadro`, porque precisa do quadro. O PR do quadro tem que ser mesclado antes deste.

## 1. Seletor de status no cartão ([src/components/CartaoTarefa.tsx](../../src/components/CartaoTarefa.tsx))

### Como era antes

O status aparecia só como uma etiqueta. Para mudar, era preciso abrir a tarefa, clicar em "Editar tarefa", trocar o status e salvar.

### Como ficou

A etiqueta de status virou um seletor com as 4 opções, na mesma ordem das colunas do quadro (`ordemStatus`):

```tsx
<select
  id={idStatus}
  value={statusSalvando ?? tarefa.status}
  onChange={(evento) => mudarStatus(evento.target.value as Status)}
>
  {ordemStatus.map((status) => (
    <option key={status} value={status}>
      {rotuloStatus[status]}
    </option>
  ))}
</select>
```

Ao escolher um status:

1. O cartão chama `atualizarTarefa` (PATCH em `/tarefas/:id`), que já existia no `api.ts`, mandando só o campo `status`.
2. Enquanto grava, aparece "Salvando..." ao lado do seletor, que já mostra a opção escolhida. Uma segunda troca nesse tempo é ignorada, para não mandar dois pedidos ao mesmo tempo.
3. Se der certo, o cartão avisa a página pela prop `aoMudarStatus`, e a página atualiza a tarefa na tela.
4. Se falhar, aparece "Não foi possível mudar o status. Tente novamente." embaixo do seletor, e o status continua o antigo.

```tsx
async function mudarStatus(novoStatus: Status) {
  if (!aoMudarStatus || statusSalvando || novoStatus === tarefa.status) {
    return
  }

  setStatusSalvando(novoStatus)
  setErroStatus('')

  try {
    await atualizarTarefa(tarefa.id, { status: novoStatus })
    aoMudarStatus(novoStatus)
  } catch {
    setErroStatus('Não foi possível mudar o status. Tente novamente.')
  } finally {
    setStatusSalvando(null)
  }
}
```

### A prop `aoMudarStatus`

| Prop | Para que serve |
| --- | --- |
| `aoMudarStatus` | Com ela, o status vira o seletor. Depois de gravar, o cartão chama essa função com o status novo, e a página atualiza a tarefa. Sem ela, o status continua como etiqueta |

Ela substituiu a prop `mostrarStatus`, criada no PR do quadro. Aquela prop só servia para esconder a etiqueta no quadro, e agora o seletor ocupa o lugar dela em todas as telas.

### O clique no seletor não abre a tarefa

O link do título cobre o cartão inteiro (`.link-cartao::after`), então um clique em qualquer parte abre a tarefa. O seletor fica numa camada acima desse link, para o clique nele não abrir a tarefa:

```css
.cartao-status {
  position: relative;
  z-index: 1;
  ...
}
```

### Acessibilidade

- O seletor tem o rótulo "Status" visível. O leitor de tela ouve "Status de Listar as tarefas na tela", porque o nome da tarefa está num texto escondido (`.visualmente-oculto`). Sem isso, numa tela com vários cartões, todos os seletores se chamariam só "Status".
- A mensagem de erro tem `role="alert"` e fica ligada ao seletor pelo `aria-describedby`.

## 2. No quadro, o cartão muda de coluna ([src/pages/Quadro.tsx](../../src/pages/Quadro.tsx))

Quando o status muda, o quadro troca o status da tarefa na lista que ele guarda. Como cada coluna filtra as tarefas pelo status, o cartão sai de uma coluna e aparece na outra, e os contadores das colunas se atualizam. Não precisa buscar tudo de novo na API.

```tsx
function statusMudou(tarefa: TarefaComProjeto, status: Status) {
  flushSync(() => {
    setTarefas((atuais) =>
      atuais.map((atual) =>
        atual.id === tarefa.id ? { ...atual, status } : atual
      )
    )
    setAviso(`${tarefa.titulo} foi para ${rotuloStatus[status]}.`)
  })

  document.getElementById(`status-${tarefa.id}`)?.focus()
}
```

### O foco acompanha o cartão

Quando o cartão muda de coluna, o React apaga o cartão da coluna antiga e cria um novo na outra. Quem usa teclado perderia o foco, que voltaria para o começo da página.

- O `flushSync` faz o React aplicar a mudança na tela na hora, e não depois.
- Logo em seguida, o foco vai para o seletor do cartão na coluna nova. Dá para continuar trocando o status pelo teclado sem se perder.

### Aviso para o leitor de tela

O quadro tem um texto escondido com `role="status"`. Quando um cartão muda de coluna, o leitor de tela anuncia, por exemplo: "Listar as tarefas na tela foi para Em andamento."

## 3. Lista de tarefas e página do projeto

O seletor também aparece nos cartões da lista de tarefas ([src/pages/ListaTarefas.tsx](../../src/pages/ListaTarefas.tsx)) e da página do projeto ([src/pages/DetalheProjeto.tsx](../../src/pages/DetalheProjeto.tsx)). Depois de gravar, as duas páginas atualizam o status da tarefa na tela.

## 4. Estilização ([src/App.css](../../src/App.css))

- O rótulo "Status" fica à esquerda, e o seletor ocupa o resto da largura do cartão.
- Borda roxa ao passar o mouse e contorno roxo ao chegar pelo teclado, como nos outros campos do app.
- A mensagem de erro usa a classe `.erro-campo`, a mesma dos formulários.
- Funciona no tema claro e no escuro.

## Testes

| Teste | Resultado |
| --- | --- |
| Mandar o mesmo PATCH que o seletor envia (`{"status":"em-andamento"}` para a tarefa 4), numa cópia do `db.json` | A tarefa foi de "A fazer" para "Em andamento", e os outros campos não mudaram |
| Contar as tarefas por status depois do PATCH | A fazer 1, Em andamento 2, Em revisão 1, Concluída 1. O total continuou em 5, sem criar nenhuma nova |
| `npm run build` e `npm run lint` | Passaram sem erros |

> O teste foi feito numa cópia do `db.json`, para não alterar os dados reais.

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`.
3. Em outro terminal, rode `npm run dev`.
4. Abra o **Quadro** e troque o status de um cartão pelo seletor. O cartão deve ir para a coluna nova, e os contadores devem mudar.
5. Recarregue a página (F5). O cartão deve continuar na coluna nova, o que mostra que o status foi gravado na API.
6. Clique no seletor e confira que a tarefa **não** abre.
7. Pelo teclado: chegue no seletor com Tab e troque o status com as setas. O foco deve continuar no seletor do cartão, já na coluna nova.
8. Faça o mesmo na lista de tarefas e na página de um projeto. O status deve mudar no cartão.
9. Pare a API (Ctrl+C) e troque um status. Deve aparecer a mensagem de erro embaixo do seletor, e o cartão não deve mudar de coluna.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/components/CartaoTarefa.tsx` | Seletor de status, gravação na API e prop `aoMudarStatus` no lugar da `mostrarStatus` |
| `src/pages/Quadro.tsx` | Move o cartão de coluna, devolve o foco e avisa o leitor de tela |
| `src/pages/ListaTarefas.tsx` | Atualiza o status na tela depois de gravar |
| `src/pages/DetalheProjeto.tsx` | Atualiza o status na tela depois de gravar |
| `src/App.css` | Estilos do seletor de status no cartão |
