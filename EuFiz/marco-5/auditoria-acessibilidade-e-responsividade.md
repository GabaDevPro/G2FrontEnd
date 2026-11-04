# Marco 5: auditoria de acessibilidade e responsividade

**Branch:** `feature/auditoria-acessibilidade`
**Autor:** Ricardo Real
**Data:** 04/11/2026
**Issue:** 37 (#40)

## O que se esperava

Lighthouse, navegação por teclado, foco visível e uso em tela pequena, com as correções feitas.

## Como a auditoria foi feita

| O quê | Como | Onde |
| --- | --- | --- |
| Lighthouse 13 | Build de produção (`vite preview`), modos celular e desktop | 11 telas |
| axe-core 4 | Regras WCAG 2.2 AA e boas práticas, tema claro e escuro | As mesmas 11 telas e mais 20 estados: erro, vazio, carregando, validação, falha ao salvar, ao excluir e ao mudar o status |
| Teclado | Tab por todas as telas, Enter, setas e voltar do navegador | 10 telas |
| Foco visível | Comparação de capturas com e sem foco, e alto contraste do Windows emulado | Links, botões, campos e pílulas |
| Tela pequena | Rolagem lateral em 320, 375, 480, 600, 768, 1024 e 1280px, tamanho do alvo de toque e texto muito longo | Todas as telas |
| Espaçamento de texto (WCAG 1.4.12) | Estouro por dentro dos controles em 320, 375, 481, 601, 640 e 768px, com e sem o espaçamento | Nova tarefa, lista, quadro e detalhe |

As ferramentas rodaram fora do projeto, numa pasta temporária, e não entraram no `package.json`. Os testes que gravam usaram uma cópia do `db.json`.

## Resultado

Menor e maior nota do Lighthouse entre as 11 telas, somando celular e desktop:

| Categoria | Antes | Depois |
| --- | --- | --- |
| Acessibilidade | 94 a 96 | **100 em todas** |
| SEO | 82 | **100 em todas** |
| Boas práticas | 96 a 100 | 96 a 100 |
| Performance | 97 a 100 | 97 a 100 |

O axe foi de `color-contrast` em todas as telas do tema claro para nenhuma violação nas 11 telas. Nos 20 estados sobrou um único aviso, explicado em [Limites conhecidos](#limites-conhecidos).

**O Lighthouse não basta.** Ele só reclamou de contraste, de `meta description` e de `robots.txt`. Todo o resto da tabela abaixo apareceu nos testes de teclado, de foco e de tela pequena: com nota 96, a pílula de prioridade não mostrava o foco, e um título longo fazia a página ter 2023px de largura numa tela de 320px.

## O que foi encontrado e corrigido

| Problema | Antes | Depois | Quem achou |
| --- | --- | --- | --- |
| Roxo como texto e como fundo de botão | 4,39:1 (menu ativo: 3,82:1). O mínimo é 4,5:1 | 5,38:1 (menu ativo: 4,65:1) | Lighthouse e axe |
| Sem `meta description` e sem `robots.txt` | SEO 82 | SEO 100 | Lighthouse |
| Texto de exemplo nos campos (`opacity: 0.7`) | 3,03:1 | 5,73:1 | Cálculo de contraste |
| Borda dos campos | 1,27:1, quase invisível. O mínimo é 3:1 | 3,58:1 (tema escuro: 3,70:1) | Cálculo de contraste |
| Título da aba | `front-end-g2` em todas as telas | O nome de cada tela | Teste de teclado |
| Trocar de tela pelo teclado | O foco caía no `body`, e o leitor de tela não tinha como perceber a tela nova | O foco vai para o conteúdo, e o próximo Tab começa nele | Teste de teclado |
| Passar pelo menu em toda tela | 4 Tabs antes do conteúdo | Link "Pular para o conteúdo" | Teste de teclado |
| Foco na pílula de prioridade marcada | Captura **idêntica** com e sem foco | Contorno de 2px | Comparação de capturas |
| Foco nos campos | Borda de 1px e sombra com 10% de cor | Contorno de 2px | Comparação de capturas |
| Alto contraste do Windows | Campo focado sem nenhum sinal, e as três pílulas iguais | Contorno no campo, e a pílula marcada com as cores do sistema | Alto contraste emulado |
| Quadro vazio em tela estreita | As colunas rolam, mas nada dentro delas recebe o foco, então o teclado não rolava | A área do quadro recebe o foco, e as setas rolam | Teste de teclado |
| Editar e Excluir no celular | Colados um no outro, sem espaço | 12px entre eles e a largura toda | Captura em 375px |
| Título, descrição ou responsável muito longos | Página de até 2023px em tela de 320px | O texto quebra, sem rolagem lateral | Teste de tela pequena |
| Endereço longo na página não encontrada | Página de 487px em tela de 320px | O texto quebra | Teste de tela pequena |
| Alvos de toque em 375px | Marca e link de voltar com 23px, seletor do cartão com 31px | 44px ou mais | Medição em 375px |
| Busca e filtros | Nenhum espaço entre o campo de busca e o rótulo do filtro | 20px | Captura em 375px |
| Menos movimento no sistema | O cartão continuava subindo ao passar o mouse | Sem transição e sem movimento | Menos movimento emulado |
| Símbolos `←`, `✎` e `+` nos links | Faziam parte do nome do link | Com `aria-hidden`, fora do nome | Leitura do código |
| Lista de projetos sem nenhum projeto | Tela em branco abaixo do título | "Nenhum projeto cadastrado." | Teste de estados |

A navegação por Tab em si já estava certa: a ordem segue a tela, nenhum controle fica de fora e não há armadilha de foco.

## 1. Contraste ([src/index.css](../../src/index.css))

Um roxo um pouco mais escuro resolve o texto e o fundo do botão de uma vez, porque tudo usa a variável `--accent`:

```css
--accent: #9333ea;
```

O tema escuro já passava e não mudou. A borda dos campos ganhou uma variável própria, `--border-campo`. A `--border`, mais clara, continua nos cartões e nas divisórias: ali ela só separa, e um campo vazio precisa da borda para dar para ver onde ele está.

## 2. Foco ao trocar de tela ([src/components/Layout.tsx](../../src/components/Layout.tsx))

```tsx
useEffect(() => {
  if (caminhoAnterior.current === pathname) return
  caminhoAnterior.current = pathname

  // O alternador Lista | Quadro devolve o foco para ele mesmo
  if (tipoNavegacao === NavigationType.Push && state?.alternouVisao) return

  // O botão voltar (POP) mantém a rolagem que o navegador restaurou
  if (tipoNavegacao !== NavigationType.Pop) {
    window.scrollTo(0, 0)
  }

  conteudo.current?.focus({ preventScroll: true })
}, [pathname, tipoNavegacao, state])
```

- Numa aplicação de uma página só, o navegador não recarrega. O link clicado some, e o foco cai no `body`. O efeito leva o foco para o `<main>`, que tem `tabIndex={-1}`: recebe foco por código, mas não entra na ordem do Tab.
- `caminhoAnterior` guarda o caminho em um `useRef`. Ao abrir o site, ele é igual ao atual e nada acontece, inclusive no `StrictMode`, que roda o efeito duas vezes em desenvolvimento.
- Trocar de visão pelo alternador continua como no Marco 4: o foco volta para o link.
- O mesmo `<main>` é o destino do link "Pular para o conteúdo", o primeiro item do Tab, que só aparece com o foco.

## 3. Título por tela ([src/components/TituloPagina.tsx](../../src/components/TituloPagina.tsx))

```tsx
function TituloPagina({ texto }: TituloPaginaProps) {
  useEffect(() => {
    document.title = `${texto} · Gerenciador de Tarefas`
  }, [texto])

  return null
}
```

Cada tela usa `<TituloPagina texto="Quadro" />`, e o detalhe usa o título da tarefa. Os estados também têm título: "Carregando tarefa", "Tarefa não encontrada" e "Não foi possível carregar a tarefa".

**A primeira versão usava o `<title>` do React 19**, que pode ser escrito em qualquer componente. Funcionava, mas o teste contou **dois** `<title>` no documento: o do React e o do `index.html`. A documentação do React avisa que, com mais de um, o comportamento do navegador não é garantido, então a versão final muda o título que já existe.

## 4. Foco visível ([src/App.css](../../src/App.css))

```css
.pilula input:focus-visible + span {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}
```

A pílula marcada já tem borda e fundo roxos, então só um contorno separa "marcada" de "marcada e com foco". Nos campos o `box-shadow` também virou `outline`: o alto contraste do Windows apaga as sombras, mas mantém os contornos.

No alto contraste, a pílula marcada passa a usar `Highlight` e `HighlightText`, a mesma solução do alternador no Marco 4.

## 5. Tela pequena

- `overflow-wrap: anywhere` em títulos, parágrafos e `dd`: palavra longa sem espaços quebra em vez de empurrar a página. Foi aplicado só no texto, e não no site inteiro, para não quebrar "Média" no meio dentro da pílula.
- `.acoes-tarefa` não tinha nenhuma regra no CSS, por isso os botões ficavam colados.
- Até 480px, a marca e o link de voltar ganham área de toque de 44px. Até 600px, o seletor do cartão também, com fonte de 16px.
- `.menu` com `flex-wrap`: com o espaçamento de texto da WCAG, ele passava 2px da tela em 320px.

## 6. Quadro pelo teclado ([src/pages/Quadro.tsx](../../src/pages/Quadro.tsx))

```tsx
<div className="quadro" role="region" aria-label="Colunas do quadro" tabIndex={0}>
```

Com cartões, o foco já levava as colunas junto. Com o quadro vazio, nada dentro dele recebia foco, e não dava para rolar pelo teclado. Agora a área é um item do Tab, e as setas rolam as colunas. No desktop, onde as colunas cabem na tela, isso é um Tab a mais, sem efeito.

## 7. Onde o React fez diferença nesta issue

### 7.1. O Layout não é desmontado

O `Layout` fica em volta do `<Outlet />`, então continua montado enquanto as telas trocam. É por isso que dá para guardar o caminho anterior em um `useRef` e colocar o efeito em um lugar só, em vez de repetir em 10 telas. Se o efeito estivesse dentro das telas, o `useRef` nasceria de novo a cada troca.

> Comparação: o Angular tem o `title` na configuração da rota e o Vue Router tem o `scrollBehavior`, que já resolvem parte disso no roteador. O React Router com `BrowserRouter` não traz isso pronto: é um efeito escrito à mão, com poucas linhas.

### 7.2. A ordem dos efeitos importa

O React roda os efeitos dos filhos antes dos efeitos dos pais. O `AlternarVisao` (filho) põe o foco no link primeiro, e o `Layout` (pai) roda depois. Sem o `return` que confere o `alternouVisao`, o `Layout` tomaria o foco de volta.

### 7.3. Componente sem nada na tela

O `TituloPagina` devolve `null`. Ele existe só pelo efeito, e pode ser usado no meio do JSX e em cada `return` antecipado das telas. Um hook como `useTituloPagina()` teria que ser chamado antes dos `if (carregando) return ...`, e o título ainda dependeria desses mesmos estados.

### 7.4. O JSX mostra o problema antes do navegador

`aria-hidden`, `aria-label` e `tabIndex` têm tipo no TSX. Um `tabindex` escrito errado, ou um valor que não existe, dá erro no `npm run build`.

## Testes

| Teste | Resultado |
| --- | --- |
| `npm run build` e `npm run lint` | Passaram. O lint mostra só o aviso que já existia no `FiltrosContext.tsx` |
| Lighthouse nas 11 telas, celular e desktop | Acessibilidade e SEO 100 em todas |
| axe nas 11 telas, tema claro e escuro | Nenhuma violação |
| axe nos 20 estados, tema claro e escuro | Só o aviso de `h1` em "Carregando tarefa" |
| Rolagem lateral em 7 larguras, de 320 a 1280px | Nenhuma |
| Texto muito longo em 320px, nas telas e em um endereço longo | Nenhuma rolagem lateral |
| Espaçamento de texto da WCAG em 6 larguras, nas 4 telas | Nenhum estouro |
| Abrir o site | O foco não se move |
| 1º Tab e Enter em "Pular para o conteúdo" | O link aparece, o foco vai para o `<main>`, e o Tab seguinte cai em "+ Nova tarefa" |
| Enter em um link do menu | Foco no `<main>`, título da aba trocado e um `<title>` só no documento |
| Voltar do navegador | Foco no `<main>` e título de volta |
| Alternador Lista \| Quadro | O foco continua no link, como no Marco 4 |
| F5 | O foco não se move |
| Salvar um projeto novo | Foco no `<main>` da tela nova, com o nome do projeto na aba |
| Enviar o formulário vazio | O foco continua indo para o primeiro campo com erro |
| Seta na pílula de prioridade | Muda a opção e mostra o contorno de 2px |
| Setas no quadro vazio em 375px | As colunas rolam |
| Alvos de toque em 375px | 44px ou mais, menos o link do projeto no meio do texto do detalhe, que tem 21px e fica fora do critério por estar em uma frase |
| Console do navegador durante os fluxos | Sem erros nem avisos |
| Mesclado com o PR #70 (issue 36) | Sem conflito. Build, lint e os testes passam com os dois juntos |

Tudo foi feito no Chrome controlado por script (Playwright e Lighthouse), mais a conferência visual das capturas. Foi essa conferência que pegou dois erros que os testes automáticos deixaram passar: a seta colada em "←Voltar" e a margem da busca, que não fazia efeito.

## Limites conhecidos

- **Seletor de status do cartão:** no Chrome do Windows, apertar ↓ com a lista fechada já troca o status e grava. Para ir de "A fazer" a "Concluída" são 3 gravações, e o cartão muda de coluna a cada uma. O caminho sem isso é abrir a lista com **Alt+↓**, escolher com as setas e confirmar com Enter: foi testado e grava só uma vez. Nada se perde e dá para trocar de volta, então não foi mudado aqui. Mudar exigiria um botão de confirmar ou gravar ao sair do campo, e essa decisão é da equipe.
- **`h1` em "Carregando tarefa":** o axe avisa que a página não tem `h1` enquanto o detalhe carrega. É um estado passageiro e uma boa prática, não um critério da WCAG, e o `h1` aparece quando a tarefa chega.
- **Boas práticas 96 em `/tarefas/999`:** o navegador registra no console a resposta 404 da API. Essa resposta é justamente o que faz a tela dizer "Tarefa não encontrada".
- **Sem teste com leitor de tela de verdade:** os papéis, nomes e o foco foram conferidos, mas ninguém ouviu no NVDA. Vale uma passada antes da apresentação final.
- **Sem teste em celular de verdade:** as larguras foram emuladas no Chrome. O zoom automático do iPhone em campos com menos de 16px é um comportamento conhecido, que não foi testado aqui.
- **Fontes em `px`:** o zoom do navegador funciona, mas a opção de "tamanho da fonte" do navegador não muda o texto. Trocar para `rem` mexeria em todo o CSS e ficou fora desta issue.
- **Performance:** a nota foi medida com a API na própria máquina. Vale medir de novo depois da publicação, no Marco 6.

## Como testar a branch

1. `npm install`
2. Em um terminal, rode `npm run api`. Em outro, rode `npm run dev`.
3. **Lighthouse:** rode `npm run build` e `npm run preview`, abra `http://localhost:4173` no Chrome e rode o Lighthouse pelo DevTools. Acessibilidade e SEO devem dar 100.
4. **Pular o menu:** recarregue a página e aperte Tab. Deve aparecer "Pular para o conteúdo". Aperte Enter e Tab: o foco cai em "+ Nova tarefa".
5. **Foco ao navegar:** chegue em um cartão com Tab e aperte Enter. O título da aba muda para o da tarefa, e o próximo Tab cai em "Voltar para a lista de tarefas".
6. **Foco na pílula:** em `/tarefas/nova`, chegue em Prioridade com Tab. A pílula marcada deve ter um contorno em volta.
7. **Alto contraste:** no DevTools, em Rendering, emule `forced-colors: active`. A pílula marcada deve aparecer destacada, e o campo com foco, com contorno.
8. **Tela pequena:** no DevTools, use a largura de 320px e passe pelas telas. Não deve haver rolagem para o lado. Em `/tarefas/1`, os botões Editar e Excluir ficam separados.
9. **Quadro vazio:** em `/quadro`, com 375px, busque `zzzz`, chegue na área das colunas com Tab e aperte →. As colunas rolam.

## Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/components/TituloPagina.tsx` | Novo: o título da aba |
| `src/components/Layout.tsx` | Foco ao trocar de tela e link "Pular para o conteúdo" |
| `src/index.css` | Roxo mais escuro, `--border-campo` e `overflow-wrap` no texto |
| `src/App.css` | Foco visível, alto contraste, menos movimento, `.acoes-tarefa` e alvos de toque |
| `src/pages/*.tsx` | `TituloPagina` em cada tela e símbolos com `aria-hidden` |
| `src/pages/Quadro.tsx` | A área das colunas recebe o foco |
| `src/pages/ListaProjetos.tsx` | Mensagem quando não há projetos |
| `index.html` | Título e `meta description` |
| `public/robots.txt` | Novo |
| `README.md` | Os novos componentes na organização do código |
| `EuFiz/marco-5/auditoria-acessibilidade-e-responsividade.md` | Novo: este arquivo |
