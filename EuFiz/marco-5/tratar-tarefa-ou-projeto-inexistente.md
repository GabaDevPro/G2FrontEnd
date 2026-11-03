# Marco 5: tarefa ou projeto inexistente

**Branch:** `issue-35-tratar-tarefa-ou-projeto-inexistente`
**Autor:** Caio Dias
**Data:** 03/11/2026
**Issue:** 35 (#38)

## O que se esperava

Abrir `/tarefas/999` ou `/projetos/999` mostra "não encontrado", e não um carregando eterno.

## Commits

| Commit | O que fez |
| --- | --- |
| `fabace1` | Tempo limite na API e "não encontrada" separado de "não foi possível carregar" nos detalhes e nas edições |
| `f2b0ba6` | `/tarefas/nova?projeto=999` mostra "Projeto não encontrado" |
| `770bdf1` | Este arquivo |

## Como ficou

- Com a API no ar, um id que não existe mostra "Tarefa não encontrada" ou "Projeto não encontrado", no detalhe e na edição.
- Nenhuma dessas telas fica mais em "Carregando..." para sempre: se a API não responde em 8 segundos, a tela desiste e avisa.
- Com a API fora do ar, a tela diz "Não foi possível carregar…", e não mais "não encontrada", como se o id estivesse errado.
- `/tarefas/nova?projeto=999` mostra "Projeto não encontrado" em vez de abrir o formulário com um projeto que não existe.

## 1. O carregando eterno ([src/api.ts](../../src/api.ts))

**O problema:** as telas de detalhe já tinham a mensagem de "não encontrada", e com a API no ar ela aparecia. O carregando eterno vinha de outro caso: quando a API aceita a conexão e não responde (travada, ou outro programa usando a porta 3000). O `fetch` não tem tempo limite, então a promise nunca terminava, o `finally` nunca rodava e o `carregando` ficava `true` para sempre.

**A solução:** o `buscarJson`, que todas as buscas usam, desiste depois de 8 segundos:

```ts
const TEMPO_LIMITE_MS = 8000

const resposta = await fetch(`${API_URL}${caminho}`, {
  signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
})
```

Quando o tempo acaba, o `fetch` dá erro, e cada tela cai no `catch` que já tinha. Como o limite fica no `buscarJson`, a lista de tarefas, o quadro e a lista de projetos também saem do "Carregando..." e mostram o aviso de erro que já tinham desde a revisão do Marco 4.

## 2. "Não encontrada" não é "a API falhou"

**O problema:** o `catch` das telas tratava qualquer erro como id inexistente. Com o `npm run api` parado, `/tarefas/1` dizia "Não existe tarefa com o id 1", e a pessoa achava que a tarefa tinha sumido.

**A solução:** o `buscarJson` lança um erro próprio quando a API responde 404:

```ts
export class ErroNaoEncontrado extends Error {}

if (resposta.status === 404) {
  throw new ErroNaoEncontrado(`${caminho} não existe`)
}
```

O `erro` das telas deixou de ser `true`/`false` e passou a dizer qual foi o problema:

```tsx
const [erro, setErro] = useState<'nao-encontrada' | 'falha' | null>(null)

// ...
} catch (falha) {
  if (ativo) {
    setErro(
      falha instanceof ErroNaoEncontrado ? 'nao-encontrada' : 'falha',
    )
  }
}
```

| Situação | O que aparece |
| --- | --- |
| A API responde 404 | "Tarefa não encontrada" / "Projeto não encontrado", como antes |
| API fora do ar ou sem responder | "Não foi possível carregar a tarefa" / "o projeto" |

Mudou nas quatro telas que buscam pelo id: [DetalheTarefa.tsx](../../src/pages/DetalheTarefa.tsx), [EditarTarefa.tsx](../../src/pages/EditarTarefa.tsx), [DetalheProjeto.tsx](../../src/pages/DetalheProjeto.tsx) e [EditarProjeto.tsx](../../src/pages/EditarProjeto.tsx). O link de voltar é o mesmo nos dois casos, inclusive o `?origem=quadro` das telas de tarefa.

## 3. Nova tarefa com projeto inexistente ([src/pages/NovaTarefa.tsx](../../src/pages/NovaTarefa.tsx))

**O problema:** `/tarefas/nova?projeto=999` abria o formulário normalmente. O seletor apagava o projeto sem avisar (proteção que já existia no `FormularioTarefa`), mas a página continuava com "← Voltar para o projeto" apontando para `/projetos/999`, e salvar também levava para lá. A pessoa criava a tarefa e caía em "Projeto não encontrado".

**A solução:** quando a URL traz `?projeto=`, a página confere se o projeto existe antes de mostrar o formulário, do mesmo jeito que as telas de detalhe:

```tsx
const [carregando, setCarregando] = useState(projetoId !== '')

// ...
try {
  await buscarProjeto(projetoId)
} catch (falha) {
  if (ativo) {
    setErro(
      falha instanceof ErroNaoEncontrado ? 'nao-encontrado' : 'falha',
    )
  }
}
```

- **Projeto não existe:** "Projeto não encontrado", com o link "Criar a tarefa escolhendo outro projeto" (para `/tarefas/nova`, mantendo o `?origem=quadro` se tiver) e "Voltar para a lista de projetos".
- **API fora do ar ou sem responder:** "Não foi possível carregar o projeto".
- **Sem `?projeto=`:** o formulário abre direto, sem buscar nada a mais.

O `useEffect` depende do `projetoId`, então clicar em "escolhendo outro projeto" (mesma página, só muda a URL) limpa o erro e mostra o formulário.

## Testes

Feitos no Edge headless, numa cópia do `db.json`. O `db.json` real não foi alterado. Para a "API que não responde", a porta 3000 ficou com um servidor que aceita a conexão e nunca responde, e a página foi lida a cada segundo, em tempo real.

| Teste | Resultado |
| --- | --- |
| `npm run build` e `npm run lint` | Passaram. O lint mostra só o aviso que já existia no `FiltrosContext.tsx` |
| API no ar: `/tarefas/999` e `/tarefas/999/editar` | "Tarefa não encontrada" |
| API no ar: `/projetos/999` e `/projetos/999/editar` | "Projeto não encontrado" |
| API no ar: `/tarefas/1` e `/projetos/1` | Abrem normalmente |
| API parada: `/tarefas/999` e `/projetos/999` | Antes: "não encontrada". Depois: "Não foi possível carregar…" |
| API que não responde: `/tarefas/999`, `/projetos/999` e `/tarefas/1/editar` | Antes: "Carregando..." para sempre. Depois: "Carregando..." por uns 8 segundos e então "Não foi possível carregar…" |
| `/tarefas/nova?projeto=999` | Antes: formulário com "Voltar para o projeto" → `/projetos/999`. Depois: "Projeto não encontrado" |
| `/tarefas/nova?projeto=999&origem=quadro` | "Projeto não encontrado", e o link do outro projeto vai para `/tarefas/nova?origem=quadro` |
| Clicar em "Criar a tarefa escolhendo outro projeto" | Formulário vazio, com "Voltar para a lista de tarefas" |
| `/tarefas/nova?projeto=1` | Formulário com o projeto já escolhido e "Voltar para o projeto" → `/projetos/1` |
| `/tarefas/nova` | Formulário normal |
| `/tarefas/nova?projeto=1` com a API parada e com a API que não responde | "Não foi possível carregar o projeto" |

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`. Em outro, rode `npm run dev`.
3. **Não encontrado:** abra `/tarefas/999`, `/projetos/999`, `/tarefas/999/editar` e `/projetos/999/editar`. Todas devem dizer "não encontrada" ou "não encontrado".
4. **Nova tarefa:** abra `/tarefas/nova?projeto=999`. Deve aparecer "Projeto não encontrado". Clique em "Criar a tarefa escolhendo outro projeto" e confira que o formulário abre.
5. **API fora do ar:** pare o `npm run api` e recarregue `/tarefas/1`. Deve aparecer "Não foi possível carregar a tarefa", e não "não encontrada".
6. **API que não responde:** com o `npm run api` ainda parado, rode no terminal:

   ```
   node -e "require('net').createServer(() => {}).listen(3000)"
   ```

   Recarregue `/projetos/1`. Deve ficar em "Carregando projeto..." por uns 8 segundos e depois mostrar "Não foi possível carregar o projeto". Pare o comando com Ctrl+C e volte a rodar o `npm run api`.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/api.ts` | Tempo limite de 8 segundos e `ErroNaoEncontrado` para o 404 |
| `src/pages/DetalheTarefa.tsx` | Separa "não encontrada" de "não foi possível carregar" |
| `src/pages/EditarTarefa.tsx` | Separa "não encontrada" de "não foi possível carregar" |
| `src/pages/DetalheProjeto.tsx` | Separa "não encontrado" de "não foi possível carregar" |
| `src/pages/EditarProjeto.tsx` | Separa "não encontrado" de "não foi possível carregar" |
| `src/pages/NovaTarefa.tsx` | Confere o `?projeto=` antes de abrir o formulário |
| `EuFiz/marco-5/tratar-tarefa-ou-projeto-inexistente.md` | Novo: este arquivo |
