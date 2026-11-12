# Marco 6: rotas internas abrem direto

**Branch:** `feature/marco6-issue-43`
**Autor:** Andcaio
**Data:** 11/11/2026
**Issue:** 43 (#46)

## O que se esperava

Recarregar ou abrir `/tarefas/2` na versão publicada não dá erro 404.

## O problema

Depois da publicação (issue 42), o site abria normalmente pela página inicial e a navegação clicando funcionava. Mas abrir um link como `https://g2frontend.onrender.com/tarefas/2` direto, ou apertar F5 em qualquer tela que não fosse a inicial, mostrava só `Not Found`.

Antes da correção:

| Caminho | Resposta |
| --- | --- |
| `/` | 200 |
| `/tarefas/2` | 404 |
| `/quadro` | 404 |
| `/projetos/1` | 404 |
| `/tarefas/nova` | 404 |

## Por que acontecia

O build gera só estes arquivos em `dist/`:

```
index.html
favicon.svg
robots.txt
assets/index-....js
assets/index-....css
```

Não existe um arquivo `tarefas/2`. A aplicação é uma SPA: as "páginas" não são arquivos, são componentes que o **React Router** escolhe olhando a URL, depois que o `index.html` e o `.js` já carregaram.

- **Clicando num link**, o React Router troca a URL pelo `history.pushState` e desenha a tela nova sem pedir nada ao servidor. Por isso funcionava.
- **Abrindo ou recarregando** a URL, o navegador pede `/tarefas/2` ao servidor. O Render procura esse arquivo, não encontra e responde 404. O React nem chega a rodar.

## A correção

Uma regra no painel do Render, no serviço `g2frontend`, em **Redirects/Rewrites**:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

Com ela, qualquer caminho que não seja um arquivo de verdade recebe o `index.html`. O React Router então lê a URL e mostra a tela certa.

- **Rewrite, e não Redirect:** um Redirect mandaria o navegador para `/index.html`, a URL mudaria e o React Router mostraria a página "não encontrada". O Rewrite devolve o conteúdo do `index.html`, mas a URL continua `/tarefas/2`.
- **Os arquivos de verdade continuam sendo servidos:** o Render só aplica a regra quando não existe arquivo no caminho. Então o `.js`, o `.css` e o `favicon.svg` continuam chegando com o tipo certo, e não como HTML.

Nenhum arquivo do código mudou. A regra fica no painel porque o Render não lê arquivos de configuração de rotas do repositório num Static Site criado pelo painel. Esta doc é o registro dela.

## Onde o React entrou (e onde não)

A correção é do **servidor**, mas existe por causa de como o React Router funciona:

- O `App.tsx` usa `BrowserRouter`, que deixa as URLs limpas (`/tarefas/2`). A alternativa seria o `HashRouter`, com URLs como `/#/tarefas/2`. Ele não precisaria da regra, porque o navegador nunca manda a parte depois do `#` ao servidor, mas as URLs ficariam piores. Manter o `BrowserRouter` e configurar o servidor é o caminho usual.
- A rota `path="*"` com a página `NaoEncontrada` continua valendo. Agora é ela que trata endereços que não existem, como `/rota-que-nao-existe`: o servidor responde 200 com o `index.html` e o React Router mostra "Página não encontrada".
- Rotas aninhadas como `/tarefas/2/editar` funcionam porque o Vite gera o `index.html` com caminhos absolutos (`/assets/index-....js`). Se fossem relativos (`assets/...`), dentro de `/tarefas/2/` o navegador procuraria `/tarefas/2/assets/...` e a tela ficaria em branco.

## Como foi conferido

Depois da regra, cada caminho foi pedido direto ao servidor, sem passar pela página inicial:

| Caminho | Resposta |
| --- | --- |
| `/tarefas/2` | 200, HTML |
| `/tarefas/2/editar` | 200, HTML |
| `/tarefas/nova?projeto=1&origem=quadro` | 200, HTML |
| `/quadro` | 200, HTML |
| `/projetos` e `/projetos/1` | 200, HTML |
| `/projetos/2/editar` | 200, HTML |
| `/rota-que-nao-existe` | 200, HTML (o React mostra "Página não encontrada") |
| `/assets/index-....js` | 200, `application/javascript` |
| `/assets/index-....css` | 200, `text/css` |
| `/favicon.svg` | 200, `image/svg+xml` |

Nenhuma resposta teve redirecionamento, ou seja, a URL fica a mesma.

**Detalhe observado:** logo depois de salvar a regra, algumas rotas (como `/tarefas/2` e `/tarefas/12`) ainda deram 404 por cerca de um minuto e meio, enquanto outras já davam 200. A regra leva um tempo para chegar a todos os servidores do Render. Depois disso, todas passaram a responder 200.

## Como testar

1. Abra direto https://g2frontend.onrender.com/tarefas/2: aparece o detalhe da tarefa 2.
2. Em qualquer tela (quadro, projetos, edição), aperte F5: a mesma tela volta.
3. Abra https://g2frontend.onrender.com/rota-que-nao-existe: aparece a página "não encontrada" da aplicação, e não o `Not Found` do servidor.
