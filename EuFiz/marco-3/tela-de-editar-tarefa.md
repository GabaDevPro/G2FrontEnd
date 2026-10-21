# Marco 3: tela de edição de tarefas

**Branch:** `Feature-tela-de-editar-tarefa`
**Autor:** Caio Dias
**Data:** 21/10/2026

## O que se esperava

- Rota `/tarefas/:id/editar`.
- Abrir com os dados atuais da tarefa.
- Salvar as alterações.

## Commits

| Commit | O que fez |
| --- | --- |
| `c84af35` Feature: criação de tela de edição de tarefa | Rota, página de edição, link no detalhe e texto do botão configurável |

## 1. Rota `/tarefas/:id/editar` ([src/App.tsx](../../src/App.tsx))

```tsx
<Route path="/tarefas/nova" element={<NovaTarefa />} />
<Route path="/tarefas/:id" element={<DetalheTarefa />} />
<Route path="/tarefas/:id/editar" element={<EditarTarefa />} />
```

A rota tem um trecho a mais (`/editar`), então não se confunde com o detalhe em `/tarefas/:id`. Ela segue o mesmo formato que a equipe usou em `/projetos/:id/editar`.

## 2. Página de edição ([src/pages/EditarTarefa.tsx](../../src/pages/EditarTarefa.tsx))

A página segue o mesmo padrão do `EditarProjeto`, que já existia no projeto.

### Abre com os dados atuais

- Pega o `id` da URL com `useParams` e busca a tarefa com `buscarTarefa` (GET em `/tarefas/:id`).
- O formulário só aparece depois que a tarefa carrega. Como o `FormularioTarefa` lê os valores iniciais só ao abrir, assim ele já vem com todos os campos preenchidos.
- Enquanto carrega, aparece "Carregando tarefa...".
- Se o id não existir, aparece "Tarefa não encontrada" com um link para a lista.
- Se o id da URL mudar antes da resposta chegar, a resposta antiga é ignorada (variável `ativo`). Sem isso, o formulário poderia abrir com os dados de outra tarefa e salvar por cima desta.

### Salva as alterações

- Ao salvar, chama `atualizarTarefa` (PATCH em `/tarefas/:id`), que já existia no `api.ts`, e volta para o detalhe da tarefa.
- Se a gravação falhar, o formulário mostra a mensagem de erro e a tela não muda.
- "Cancelar" e "← Voltar para a tarefa" voltam para o detalhe sem salvar.

### Visual

O visual é o mesmo da tela de nova tarefa: link de voltar no topo, título "Editar tarefa" e um subtítulo com o nome da tarefa que está sendo editada. O formulário fica no cartão com os mesmos estilos.

## 3. Outros ajustes

- **Link "Editar tarefa"** na página de detalhe ([src/pages/DetalheTarefa.tsx](../../src/pages/DetalheTarefa.tsx)).
- **`FormularioTarefa`** ([src/components/FormularioTarefa.tsx](../../src/components/FormularioTarefa.tsx)) ganhou a prop opcional `textoBotao`, igual à do `FormularioProjeto`. Na edição o botão diz "Salvar alterações". Sem a prop ele continua "Salvar tarefa", então a tela de criação não mudou.
- **README:** a rota nova entrou na tabela de telas.

## Testes

| Teste | Resultado |
| --- | --- |
| Abrir `/tarefas/2/editar` no navegador | Todos os campos vieram preenchidos: projeto, título, descrição, status "Em andamento", prioridade "Alta", responsável e prazo |
| Página de detalhe da tarefa 2 | Mostra o link "Editar tarefa" |
| Mandar o mesmo PATCH que a tela envia, numa cópia do `db.json`, mudando projeto, título, status, prioridade e prazo | Tudo gravado, e o total continuou em 5 tarefas, sem criar nenhuma nova |
| `npm run build` e `npm run lint` | Passaram sem erros |

> O salvamento não foi feito pelo navegador, para não alterar o `db.json` real.

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`.
3. Em outro terminal, rode `npm run dev`.
4. Abra uma tarefa e clique em "Editar tarefa". Os campos devem vir preenchidos com os dados atuais.
5. Altere alguns campos e clique em "Salvar alterações". A tela volta para o detalhe com os dados novos.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/pages/EditarTarefa.tsx` | Novo: página de edição |
| `src/App.tsx` | Rota `/tarefas/:id/editar` |
| `src/pages/DetalheTarefa.tsx` | Link "Editar tarefa" |
| `src/components/FormularioTarefa.tsx` | Prop opcional `textoBotao` |
| `README.md` | Rota nova na tabela de telas |
