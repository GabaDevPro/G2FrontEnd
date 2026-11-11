# Marco 6: gerar e conferir o build de produção

**Branch:** `feature/marco6-issue-41-build` (saiu da `feature/marco6-issues-39-41`, PR #73)
**Autor:** GabaDevPro
**Data:** 11/11/2026
**Issue:** 41 (#44)

## O que se esperava

`npm run build` sem erros e a aplicação testada a partir do build.

## Commits

- `4da9fff` docs: README explica como testar a versão de produção
- este relatório

Nenhum arquivo de código mudou: o build já passou na primeira tentativa.

## 1. O build

```bash
npm run build
```

O script faz duas coisas, nesta ordem (`package.json`):

1. `tsc -b`: o TypeScript confere os tipos de todo o projeto. Se algum tipo estiver errado, o build para aqui.
2. `vite build`: o Vite junta todos os arquivos em poucos arquivos otimizados na pasta `dist/`.

Resultado, sem erros e sem avisos:

| Arquivo | Tamanho | Com gzip |
| --- | --- | --- |
| `dist/index.html` | 0,62 kB | 0,37 kB |
| `dist/assets/index-….css` | 13,13 kB | 3,34 kB |
| `dist/assets/index-….js` | 296,97 kB | 89,89 kB |

Os 50 módulos do `src` (componentes, páginas, contexto, `api.ts`) viraram **um** JavaScript e **um** CSS. O código no nome (`BoQQTz0c`) muda sempre que o conteúdo muda, então o navegador nunca usa uma versão velha guardada em cache.

## 2. O teste a partir do build

Com `npm run api` e `npm run preview` rodando (o preview serve a `dist/` em `http://localhost:4173`):

| O que testei | Resultado |
| --- | --- |
| `index.html`, JS e CSS | respondem 200 |
| Endereço da API no JS gerado | `localhost:3000`, vindo do `.env.production` da issue 39 |
| CORS da API | `Access-Control-Allow-Origin: *`: o site em outra porta consegue buscar os dados |
| `/` (lista), `/quadro`, `/projetos` | carregam com os dados da API |
| `/tarefas/2`, `/tarefas/2/editar`, `/projetos/1` | abrem direto pelo endereço, com os dados |
| `/tarefas/999` | "Tarefa não encontrada" |
| `/rota-inexistente` | "Página não encontrada" |
| API desligada | "Não foi possível carregar as tarefas." + botão "Tentar de novo" |

As telas foram abertas no Edge em modo headless (`--dump-dom`), que roda o JavaScript de verdade. Não basta checar o código HTTP: o `index.html` vem sempre igual, e quem desenha a tela é o React depois de carregar.

**Atenção para a issue 43 (Caio):** abrir `/tarefas/2` direto funcionou aqui porque o `vite preview` devolve o `index.html` para qualquer endereço. Uma hospedagem estática não faz isso sozinha e responde 404, e é exatamente isso que a issue 43 resolve.

## Onde o React entrou

- **A tela é montada no navegador.** O `dist/index.html` é praticamente vazio: só uma `<div id="root">` e o `<script>`. Todo o conteúdo é o React desenhando a partir do `main.tsx` (`createRoot(...).render(<App />)`). Por isso o build cabe numa hospedagem **estática**: não precisa de servidor rodando código, só de alguém que entregue arquivos.
- **As rotas são do React Router, não do servidor.** `/quadro` e `/tarefas/2` não existem como arquivos na `dist/`. O React Router lê o endereço da barra e escolhe o componente (`<Route path="/tarefas/:id" ...>`). Daí vem o problema do 404 da issue 43.
- **O JSX virou JavaScript.** O navegador não entende JSX nem TypeScript. O build transforma `<Quadro />` em chamadas comuns de função e tira os tipos. O `tsc -b` usa os tipos só para conferir, antes.
- **React em modo de produção.** No build, o React vem sem as checagens e os avisos de desenvolvimento (por exemplo, o aviso de `key` faltando em lista). Fica menor e mais rápido, e por isso vale testar o build e não só o `npm run dev`.

## Como testar

Siga a seção "Testar a versão de produção" do README: `npm run api`, `npm run build`, `npm run preview` e abra `http://localhost:4173`.
