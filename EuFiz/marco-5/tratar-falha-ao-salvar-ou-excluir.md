# Marco 5: tratar falha ao salvar ou excluir

**Branch:** `issue-39-tratar-erro-ao-salvar-ou-excluir`
**Autor:** Caio Dias
**Data:** 04/11/2026
**Issue:** 36 (#39)

## O que se esperava

O usuário é avisado e não perde o que digitou.

## O que já existia e o que faltava

Os formulários de tarefa e de projeto já capturavam a falha (`try/catch` em volta do `aoSalvar`), mostravam um aviso e mantinham os campos. A exclusão de tarefa e a troca de status no cartão também já avisavam.

Testando cada caso, sobraram três problemas:

| Caso | Antes |
| --- | --- |
| API parada ou respondendo com erro (500) | Avisava, mas só "Não foi possível salvar a tarefa. Tente novamente.", sem dizer o que conferir nem que os dados continuavam ali |
| API que aceita a conexão e não responde | **Não avisava nunca.** O botão ficava em "Salvando..." (ou "Excluindo...") para sempre |
| Quem usa teclado, depois da falha | O foco ia para o topo da página, e era preciso passar por todos os campos de novo para chegar ao botão |

## Como ficou

- Salvar ou excluir sem resposta em 8 segundos desiste e mostra o aviso, como já acontecia ao carregar as telas.
- O aviso diz o que aconteceu, o que conferir e que nada foi perdido: "Não foi possível salvar a tarefa. Verifique se a API está rodando e tente de novo. O que você digitou continua no formulário."
- O foco continua no botão. Depois da falha, basta apertar Enter (ou clicar) para tentar de novo.
- Clicar várias vezes enquanto salva continua mandando uma gravação só.

Vale para: nova tarefa, editar tarefa, novo projeto, editar projeto, excluir tarefa e mudar o status pelo cartão (este só ganhou o tempo limite).

## 1. Tempo limite também ao gravar ([src/api.ts](../../src/api.ts))

As funções de leitura (`buscarJson`) já tinham `signal: AbortSignal.timeout(TEMPO_LIMITE_MS)`. As de gravação (`criarTarefa`, `criarProjeto`, `atualizarTarefa`, `atualizarProjeto`, `excluirTarefa`) não tinham, e um `fetch` sem limite espera para sempre. Todas ganharam a mesma linha:

```ts
const resposta = await fetch(`${API_URL}/tarefas/${id}`, {
  method: 'PATCH',
  signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  // ...
})
```

Quando o tempo acaba, o `fetch` lança um erro, e o `catch` do formulário que já existia mostra o aviso. Não foi preciso mexer nas telas.

## 2. Mensagens ([FormularioTarefa.tsx](../../src/components/FormularioTarefa.tsx), [FormularioProjeto.tsx](../../src/components/FormularioProjeto.tsx), [DetalheTarefa.tsx](../../src/pages/DetalheTarefa.tsx))

Seguem o padrão da issue 33 ("Verifique se a API está rodando") e, nos formulários, deixam claro que o que foi digitado não se perdeu. O aviso continua em um `role="alert"`, então o leitor de tela o anuncia.

## 3. O foco fica no botão

Antes, o botão de salvar ficava com `disabled` enquanto salvava. Um botão desabilitado não pode ter foco, então o navegador tira o foco dele e manda para o `body`. Quando a gravação falhava, o botão voltava a funcionar, mas o foco já tinha ido embora.

Agora, enquanto salva, o botão usa `aria-disabled`:

```tsx
<button
  type="submit"
  className="botao botao-primario"
  disabled={carregandoProjetos || !!erroProjetos}
  aria-disabled={salvando}
>
```

- O leitor de tela continua dizendo que o botão está indisponível, e o CSS (`.botao[aria-disabled='true']`) o deixa com a mesma aparência de desabilitado.
- Ele não é desabilitado de verdade, então o foco fica nele.
- Um segundo envio já era barrado no começo da função (`if (salvando) return`), então continua indo uma gravação só.

O botão "Excluir tarefa" recebeu a mesma troca. Os outros `disabled` (projetos carregando, botão Cancelar) não mudaram, porque o foco não está neles na hora do envio.

## 4. Onde o React fez diferença nesta issue

### 4.1. "Não perder o que digitou" já vem do estado

Os campos são **controlados**: o valor de cada um mora no estado do componente (`useState`), e o `<input>` só mostra esse valor. Uma falha na API não apaga o estado. O formulário continua montado, com os mesmos dados, e o próximo envio usa exatamente o que está na tela. Nenhuma linha de código foi preciso para guardar ou restaurar o que a pessoa digitou.

> Comparação: sem um framework, seria comum recriar o HTML do formulário ao mostrar a mensagem de erro (com `innerHTML`, por exemplo) e perder os valores digitados. No React, mostrar o aviso só muda `erroSalvar`, e o React atualiza apenas o parágrafo do aviso, sem tocar nos campos.

### 4.2. O aviso é uma consequência do estado

`{erroSalvar && <p className="alerta" role="alert">{erroSalvar}</p>}`: o `catch` só guarda o texto no estado, e o React mostra o aviso. Na próxima tentativa, `setErroSalvar('')` o tira da tela. É o mesmo jeito declarativo das issues 33 e 34.

### 4.3. A tela decide o que fazer depois de salvar, o formulário decide como avisar

O formulário recebe `aoSalvar` como prop e só espera a `Promise`. Se ela falha, o formulário avisa. Se dá certo, a página que passou a função navega para outro lugar. Por isso o tempo limite entrou só na `api.ts`: o erro dela chega ao `catch` do formulário sem nenhuma mudança nas quatro páginas que o usam.

## Como testar

1. `npm run api` em um terminal e `npm run dev` em outro.
2. **API parada:** abra `/tarefas/nova?projeto=1`, preencha os campos, pare o `npm run api` (Ctrl+C) e clique em **Criar tarefa**. O aviso aparece e os campos continuam preenchidos. Rode `npm run api` de novo e aperte Enter: a tarefa é salva.
3. Faça o mesmo em `/tarefas/1/editar`, `/projetos/novo`, `/projetos/1/editar` e no botão **Excluir tarefa** de `/tarefas/1`.
4. **API que não responde:** com a tela já aberta, pare o `npm run api` e rode, no lugar dele, um servidor que aceita a conexão e nunca responde:

   ```
   node -e "require('net').createServer(() => {}).listen(3000)"
   ```

   Clique em salvar: o botão fica em "Salvando..." e, depois de uns 8 segundos, aparece o aviso. Antes desta issue, ele ficava em "Salvando..." para sempre.
5. **Teclado:** depois de qualquer falha, o foco continua no botão. Apertar Enter tenta de novo.

Esses passos foram feitos em um navegador controlado por script (Playwright com o Chrome), com uma cópia do `db.json`. Para cada uma das telas, foram testadas a API parada, a resposta 500 e a API sem resposta. Também foram testados o caminho de sucesso (criar, editar e excluir) e uma nova tentativa depois do tempo limite. Tudo passou.

`npm run build` e `npm run lint` passam. O lint mostra só o aviso que já existia no `FiltrosContext.tsx`.

## Limite conhecido

Se a API receber a gravação mas demorar mais de 8 segundos para responder, a tela mostra a falha mesmo que a tarefa tenha sido salva, e tentar de novo pode criar uma tarefa repetida. Com o json-server rodando na própria máquina isso não acontece na prática, então ficou fora desta issue.
