# Marco 6: tirar a URL da API do código

**Branch:** `feature/marco6-issues-39-41`
**Autor:** GabaDevPro
**Data:** 11/11/2026
**Issue:** 39 (#42)

## O que se esperava

Endereço da API em variável de ambiente, com valores diferentes para desenvolvimento e produção.

## Commits

- `0559e43` chore: endereço da API nos arquivos .env de desenvolvimento e produção
- `1caeec3` feat: api.ts lê o endereço da API de VITE_API_URL
- `a16790a` docs: README explica a variável VITE_API_URL

## O que já existia e o que faltava

Todas as chamadas à API já passavam pelo `src/api.ts`, que montava as URLs a partir de uma constante só:

```ts
const API_URL = 'http://localhost:3000'
```

Então bastava mudar uma linha. O problema: com o endereço escrito no código, a versão publicada também tentaria buscar os dados em `localhost`, ou seja, no computador de quem abre o site.

## Como ficou

### 1. Os arquivos `.env`

| Arquivo | Lido por | Valor |
| --- | --- | --- |
| `.env.development` | `npm run dev` | `http://localhost:3000` |
| `.env.production` | `npm run build` / `npm run preview` | provisório `http://localhost:3000`, troca na issue 40 |

O Vite escolhe o arquivo pelo **modo**: `dev` roda em modo `development` e `build` em modo `production`.

Os dois arquivos vão para o Git de propósito. O endereço da API não é segredo, porque fica visível no JavaScript que o navegador baixa. Para mudar o endereço só na sua máquina existe o `.env.development.local`, que o `.gitignore` já ignora (`*.local`).

### 2. O `api.ts` ([src/api.ts](../../src/api.ts))

```ts
const API_URL = import.meta.env.VITE_API_URL
```

- `import.meta.env` é o objeto em que o Vite coloca as variáveis.
- Só as que começam com `VITE_` chegam ao navegador. É uma proteção para nenhuma senha do ambiente vazar sem querer.
- O TypeScript já conhecia `import.meta.env` porque o `tsconfig.app.json` tem `"types": ["vite/client"]`.
- No build, o Vite **substitui** `import.meta.env.VITE_API_URL` pelo texto do endereço. Conferido: o arquivo gerado em `dist/assets` tem `localhost:3000` escrito direto.

### 3. README

Nova seção "Endereço da API" explicando os arquivos e o `.local`.

## Onde o React entrou (e onde não)

Quase nada. Esta issue é do **Vite**, a ferramenta que roda e empacota o projeto, não do React:

- quem lê os `.env` e troca `import.meta.env.VITE_API_URL` pelo valor é o Vite, antes de o React rodar;
- os componentes (`ListaTarefas`, `Quadro`, `DetalheTarefa`...) não mudaram nada, porque nenhum deles conhece o endereço da API. Eles chamam funções como `buscarTarefas()` e recebem os dados.

O React aparece justamente por essa separação: os componentes só cuidam da tela (estado, `useEffect`, renderização) e deixam o acesso aos dados no `api.ts`. Por isso trocar de onde vêm os dados mexeu em **uma linha** e em nenhum componente. Se cada componente tivesse o seu `fetch('http://localhost:3000/...')`, a issue seria caçar o endereço tela por tela.

Em outros frameworks a ideia é a mesma, só muda o prefixo, por exemplo `NEXT_PUBLIC_` no Next.js. A variável é "pública" porque vai parar no código do navegador.

## Como testar

1. `npm run api` e `npm run dev`: a aplicação carrega os dados normalmente.
2. Crie um `.env.development.local` com `VITE_API_URL=http://localhost:9999` e reinicie o `npm run dev`: as telas mostram o erro com "Tentar de novo", prova de que o endereço vem da variável. Apague o arquivo depois.
3. `npx tsc -b` e `npm run lint` sem erros.
