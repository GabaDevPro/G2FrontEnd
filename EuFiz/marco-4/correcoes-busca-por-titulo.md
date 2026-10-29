# Marco 4: correções da busca por título

**Branch:** `ccr-a4d42250-9lqttm`
**Autor:** GabaDevPro
**Data:** 28/10/2026

## O que se esperava

Corrigir dois bugs que apareceram depois do PR #62 (busca por título na lista de tarefas, issue #24), sem adiantar nenhuma outra issue de nenhum marco.

## 1. A página fica em branco se alguma tarefa vier sem título

**O problema:** se uma tarefa tiver `titulo` ausente ou `null` (por exemplo, depois de editar o `db.json` à mão), a lista de tarefas quebrava inteira com:

```
Cannot read properties of null (reading 'toLowerCase')
```

Antes do PR #62 a lista aparecia normalmente.

**A causa:** o filtro da busca chama `toLowerCase()` no título de todas as tarefas, mesmo com a busca vazia. Sem título, não há o que chamar.

**A solução** ([src/pages/ListaTarefas.tsx](../../src/pages/ListaTarefas.tsx)): título ausente conta como texto vazio.

```tsx
// Tarefa sem título (db.json editado à mão) conta como título vazio
const tarefasFiltradas = tarefas.filter((tarefa) =>
  (tarefa.titulo ?? '').toLowerCase().includes(termo)
)
```

Com a busca vazia a tarefa sem título continua aparecendo, como antes do PR. Com algo digitado ela some, porque não tem título que combine.

## 2. A página rola para o lado no celular com termo longo

**O problema:** em 390px, um termo longo sem espaços (por exemplo, um link colado) estourava a linha `Nenhuma tarefa com "…" no título.` e criava rolagem horizontal. É o mesmo tipo de bug do #60.

**A solução** ([src/App.css](../../src/App.css)): uma linha no `.resultado-busca`, que deixa o texto quebrar em qualquer ponto quando não cabe.

```css
.resultado-busca {
  ...
  /* Termo longo sem espaços (um link colado) quebra em vez de rolar a página */
  overflow-wrap: anywhere;
}
```

## Testes

| Teste | Resultado |
| --- | --- |
| `npm run build` e `npm run lint` | Passaram sem erros |
| Lista com uma tarefa de `titulo: null` e outra sem `titulo` (Playwright, 390px) | Sem a correção: página em branco e o erro acima. Com a correção: os 5 cartões aparecem, sem erro |
| Busca por `https://exemplo.com/?q=` seguido de 80 letras `x` (Playwright, 390px) | Sem a correção: a página fica com 712px de largura e rola para o lado. Com a correção: 375px, sem rolagem |

## Como testar a branch

1. `npm install`
2. No `db.json`, troque o `"titulo"` de uma tarefa por `null` (ou apague a linha).
3. Em um terminal, rode `npm run api`.
4. Em outro terminal, rode `npm run dev`.
5. **Tarefa sem título:** abra a lista de tarefas. Ela deve aparecer normalmente, com todas as tarefas.
6. **Termo longo:** no DevTools, use a largura de 390px e cole na busca um link longo sem espaços. A mensagem "Nenhuma tarefa com …" deve quebrar em várias linhas, sem rolagem para o lado.
7. Desfaça a mudança no `db.json`.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/pages/ListaTarefas.tsx` | `(tarefa.titulo ?? '')` no filtro da busca |
| `src/App.css` | `overflow-wrap: anywhere` no `.resultado-busca` |
| `EuFiz/marco-4/correcoes-busca-por-titulo.md` | Novo: este arquivo |
