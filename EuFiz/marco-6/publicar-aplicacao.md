# Marco 6: publicar a aplicação

**Branch:** `feature/marco6-issue-42`
**Autor:** Andcaio
**Data:** 11/11/2026
**Issue:** 42 (#45)

## O que se esperava

Aplicação no ar em hospedagem estática, com o link no README.

## Commits

- `a7be020` docs: adiciona link da aplicação publicada no README
- este documento

## Resultado

**https://g2frontend.onrender.com**

## Por que hospedagem estática

Depois do `npm run build`, a aplicação vira só arquivos prontos em `dist/`: um `index.html`, um `.js` e um `.css`. Não existe código rodando no servidor; quem executa o React é o navegador de quem abre o site. Então a hospedagem só precisa entregar esses arquivos, e é isso que um "Static Site" faz.

Quem precisa de um servidor rodando de verdade é a API (json-server), e ela já estava publicada pela issue 40 em `https://g2frontend-api.onrender.com`.

## Por que o Render

- A API já está lá, então as duas partes ficam no mesmo lugar.
- O repositório é público, e o Render aceita a URL dele direto, sem precisar que o dono do repositório autorize um app na conta do GitHub.
- A regra que faz as rotas internas abrirem direto (issue 43) é uma configuração do painel, sem mudar o código.

## Como foi configurado

No painel do Render: **New → Static Site → Public Git Repository**, com `https://github.com/GabaDevPro/G2FrontEnd`.

| Campo | Valor | Por quê |
| --- | --- | --- |
| Branch | `main` | publica só o que já passou por PR |
| Build Command | `npm ci && npm run build` | `npm ci` instala exatamente as versões do `package-lock.json`, as mesmas que a equipe testou |
| Publish Directory | `dist` | a pasta que o `vite build` gera |
| `NODE_VERSION` | `22` | o Vite 8 exige Node 22.12 ou mais novo |

Não foi preciso configurar o endereço da API no Render: o `.env.production` já está no repositório com `VITE_API_URL=https://g2frontend-api.onrender.com` (issues 39 e 40), e o `npm run build` lê esse arquivo.

## O que mudou no repositório

Só o README, que ganhou a seção "Aplicação publicada" com os links do site e da API. A frase de abertura dizia que os dados vinham de "uma API local", o que deixou de ser verdade na versão publicada.

## Onde o React entrou (e onde não)

O código React não mudou. Publicar é trabalho do **build do Vite** e da **hospedagem**:

- o Vite junta os componentes, o React e o React Router num único `.js` e coloca nele o endereço da API;
- o Render só entrega esses arquivos.

Isso só funciona porque a aplicação é uma SPA: o servidor manda sempre o mesmo `index.html`, e quem decide qual tela mostrar é o React Router, olhando a URL no navegador. É por isso que, sem uma regra no servidor, recarregar `/tarefas/2` dá 404: o Render procura um arquivo `tarefas/2` que não existe. Esse é o assunto da issue 43.

## Como foi conferido

- O build local a partir do `main` (`npm ci && npm run build`) gerou `index-DLQ5ltr7.js`, o mesmo nome de arquivo publicado no site. Como o nome vem de um hash do conteúdo, é o mesmo código.
- O `.js` publicado contém `g2frontend-api.onrender.com` e não contém `localhost:3000`.
- A API responde com `access-control-allow-origin: *` para pedidos vindos de `https://g2frontend.onrender.com`, inclusive no preflight do `PATCH`. Ou seja, o navegador deixa o site buscar e salvar os dados.
- `/` responde 200. `/tarefas/2` e `/quadro` respondem 404 quando abertos direto, o que é esperado até a issue 43.

## Limitações

- **API suspensa:** no plano gratuito, a API dorme depois de um tempo sem uso e leva perto de um minuto para voltar. O `src/api.ts` desiste depois de 8 segundos, então o primeiro acesso pode mostrar a tela de erro. O "Tentar de novo" resolve depois que a API acorda.
- **Deploy automático:** como o repositório foi conectado pela URL pública, pode ser preciso usar **Manual Deploy → Deploy latest commit** depois de um merge no `main`.

## Como testar

1. Abra https://g2frontend.onrender.com: a lista de tarefas carrega com os dados da API.
2. Navegue clicando por Quadro, Projetos e por uma tarefa: tudo funciona.
3. Crie, edite e exclua uma tarefa: as mudanças aparecem no site.
