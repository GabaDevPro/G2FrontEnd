# Marco 4: visão de quadro

**Branch:** `Feature-quadro`
**Autor:** Caio Dias
**Data:** 26/10/2026

## O que se esperava

- Rota `/quadro`.
- Uma coluna por status, com os cartões das tarefas agrupados (estilo kanban).

## Commits

| Commit | O que fez |
| --- | --- |
| `2898bb3` Feature: visão do quadro | Rota `/quadro`, página do quadro, link no menu e estilos das colunas |
| `c2af159` Fix: correção de mudanças de pagina e criação de tarefa pelo quadro | Fim da tremida ao trocar de tela, cartões do mesmo tamanho e o "voltar" levando para o quadro |

## 1. Visão de quadro

### Rota `/quadro` ([src/App.tsx](../../src/App.tsx))

```tsx
<Route path="/quadro" element={<Quadro />} />
```

O menu do topo ([src/components/Layout.tsx](../../src/components/Layout.tsx)) ganhou o link "Quadro", entre "Tarefas" e "Projetos".

### Página ([src/pages/Quadro.tsx](../../src/pages/Quadro.tsx))

- Busca todas as tarefas com `listarTarefasComProjeto`, a mesma função da lista de tarefas.
- Monta uma coluna para cada status, na ordem do caminho que a tarefa percorre: **A fazer → Em andamento → Em revisão → Concluída**. A ordem ficou em `ordemStatus`, no [src/rotulos.ts](../../src/rotulos.ts).
- Cada coluna filtra as tarefas do seu status e mostra os cartões.
- O título da coluna mostra quantas tarefas ela tem. O leitor de tela ouve, por exemplo, "Em andamento 1 tarefa".
- Coluna sem tarefas mostra "Nenhuma tarefa".
- Enquanto carrega aparece "Carregando quadro...", e se a API falhar aparece uma mensagem de erro.
- Botão "+ Nova tarefa" no topo, igual ao da lista.

```tsx
{ordemStatus.map((status) => {
  const tarefasDaColuna = tarefas.filter(
    (tarefa) => tarefa.status === status
  )
  ...
})}
```

### Cartões ([src/components/CartaoTarefa.tsx](../../src/components/CartaoTarefa.tsx))

O quadro usa o mesmo `CartaoTarefa` da lista e da página do projeto. Ele ganhou duas props opcionais:

| Prop | Para que serve |
| --- | --- |
| `mostrarStatus` | No quadro é `false`: a coluna já diz o status, então a etiqueta sai do cartão |
| `origem` | No quadro é `"quadro"`: o link do cartão leva `?origem=quadro` (ver a parte 2) |

Sem essas props o cartão continua como antes, então a lista e a página do projeto não mudaram.

### Visual de kanban ([src/App.css](../../src/App.css))

- Cada coluna tem fundo próprio e uma faixa colorida no topo: cinza (A fazer), azul (Em andamento), roxo (Em revisão) e verde (Concluída).
- Os cartões ficam com fundo da página por cima da coluna, como num quadro de verdade.
- No computador as 4 colunas cabem lado a lado.
- Em telas estreitas as colunas não ficam espremidas: o quadro rola para o lado e cada coluna para encaixada no início (`scroll-snap`), como no Trello.
- Funciona no tema claro e no escuro.

## 2. Correções depois do quadro

### Tela tremendo ao trocar de página

**O problema:** ao trocar de "Tarefas" para "Quadro", a página dava uma tremida para o lado.

**A causa:** a lista de tarefas é mais alta que a tela e tem barra de rolagem. O quadro, enquanto carrega, cabe na tela, então a barra some e depois volta. No Windows a barra ocupa uns 17px, e a página, que é centralizada, pulava metade disso para cada lado.

**A solução** ([src/index.css](../../src/index.css)): o espaço da barra fica sempre reservado.

```css
html {
  scrollbar-gutter: stable;
}
```

### Cartões de tamanhos diferentes no quadro

**O problema:** títulos longos quebravam em várias linhas, então cada cartão tinha uma altura.

**A solução** (só dentro do quadro, em [src/App.css](../../src/App.css)):

- O título sempre ocupa o espaço de duas linhas. Se passar disso, é cortado com "…" (`line-clamp`).
- Projeto, responsável e prazo ficam numa linha só, cortados com "…" se forem longos.
- Passando o mouse no título aparece o texto inteiro (atributo `title` no link).

Foram escolhidas duas linhas, e não uma, porque a coluna tem uns 200px úteis. Com uma linha, quase todo título seria cortado.

### Voltar para o quadro

**O problema:** quem criava ou abria uma tarefa pelo quadro era mandado de volta para a lista de tarefas.

**A solução:** o quadro passa `?origem=quadro` na URL, no mesmo esquema do `?projeto=` que a tela de nova tarefa já usava.

| Tela | O que mudou |
| --- | --- |
| [Quadro.tsx](../../src/pages/Quadro.tsx) | "+ Nova tarefa" abre `/tarefas/nova?origem=quadro`, e os cartões abrem `/tarefas/:id?origem=quadro` |
| [NovaTarefa.tsx](../../src/pages/NovaTarefa.tsx) | Com `?origem=quadro`, salvar, cancelar e "← Voltar para o quadro" levam a `/quadro` |
| [DetalheTarefa.tsx](../../src/pages/DetalheTarefa.tsx) | Com `?origem=quadro`, o link do topo vira "← Voltar para o quadro", e o botão "Editar tarefa" repassa o parâmetro |
| [EditarTarefa.tsx](../../src/pages/EditarTarefa.tsx) | Salvar, cancelar e voltar devolvem o parâmetro ao detalhe |

Assim o caminho todo lembra de onde a pessoa veio: quadro → tarefa → editar → salvar → tarefa → voltar → quadro. Isso importa porque mudar o status pela edição é o jeito de mover um cartão de coluna. Quem abre pela lista continua voltando para a lista, como antes.

## Testes

| Teste | Resultado |
| --- | --- |
| `npm run build` e `npm run lint` | Passaram sem erros |

Com o `db.json` atual, o quadro deve mostrar:

| Coluna | Tarefas |
| --- | --- |
| A fazer | 2 (Listar as tarefas na tela, Desenhar o diagrama ER) |
| Em andamento | 1 (Subir o json-server) |
| Em revisão | 1 (Montar o quadro no GitHub Projects) |
| Concluída | 1 (Criar o repositório) |

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`.
3. Em outro terminal, rode `npm run dev`.
4. **Quadro:** clique em "Quadro" no menu. As tarefas devem aparecer nas colunas da tabela acima, com os cartões do mesmo tamanho.
5. **Criar pelo quadro:** clique em "+ Nova tarefa" no quadro, preencha e salve. A tela deve voltar para o quadro, com a tarefa nova na coluna do status escolhido.
6. **Voltar para o quadro:** abra uma tarefa pelo quadro, clique em "Editar tarefa", mude o status e salve. Clique em "← Voltar para o quadro": o cartão deve estar na coluna nova.
7. Diminua a largura da janela: o quadro deve rolar para o lado, sem espremer as colunas.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/pages/Quadro.tsx` | Novo: página do quadro |
| `src/components/CartaoTarefa.tsx` | Props `mostrarStatus` e `origem`, e `title` no link |
| `src/pages/NovaTarefa.tsx` | Volta para o quadro com `?origem=quadro` |
| `src/pages/DetalheTarefa.tsx` | Volta para o quadro e repassa o parâmetro para a edição |
| `src/pages/EditarTarefa.tsx` | Devolve o parâmetro ao detalhe |
| `src/App.tsx` | Rota `/quadro` |
| `src/components/Layout.tsx` | Link "Quadro" no menu |
| `src/rotulos.ts` | `ordemStatus`, a ordem das colunas |
| `src/App.css` | Estilos das colunas e dos cartões do quadro |
| `src/index.css` | `scrollbar-gutter: stable`, contra a tremida ao trocar de tela |
| `README.md` | Rota `/quadro` e o parâmetro `?origem=quadro` na tabela de telas |
