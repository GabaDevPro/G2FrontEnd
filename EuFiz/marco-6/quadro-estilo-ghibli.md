# Extra: quadro e lista no estilo Studio Ghibli

**Branch:** `claude/ecstatic-euler-xv2tum`
**Autor:** RicardoRealDev
**Data:** 12/11/2026
**Issue:** não tem. É um extra em cima do arrastar e soltar da issue 46.

## O que se esperava

O quadro com a cara dos filmes do Studio Ghibli, com várias referências, e o Totoro pegando o cartão quando ele muda de coluna. Personagens obrigatórios: Totoro, Sem Rosto, Totoro em pixel art e Ponyo.

## Onde está cada referência

| Onde | Filme | O que aparece |
| --- | --- | --- |
| Ao lado da busca | Meu Amigo Totoro | Os três Totoros num morro, com as bolinhas de fuligem |
| Arrastando um cartão | Meu Amigo Totoro | O Totoro segura o cartão e acompanha o ponteiro |
| Coluna "A fazer" | Meu Amigo Totoro | O Totoro pequeno, uma bolota e um broto |
| Coluna "Em andamento" | O Castelo Animado | Calcifer |
| Coluna "Em revisão" | A Viagem de Chihiro | O Sem Rosto |
| Coluna "Concluída" | Ponyo | A Ponyo com o balde |
| Coluna "Sem status" | Princesa Mononoke | Os kodamas |
| Coluna vazia | A Viagem de Chihiro | As bolinhas de fuligem |
| Carregando e chão do quadro | Meu Amigo Totoro | O Totoro em pixel art |
| Chão do quadro | O Serviço de Entregas da Kiki | O gato Jiji |

## Como funciona

- **Desenhos (`src/components/Ghibli.tsx`):** cada personagem é um componente que devolve um SVG. Não há arquivo de imagem. O Totoro grande, o médio e o pequeno são o mesmo desenho com cor e escala diferentes. O Totoro em pixel art é uma lista de textos em que cada letra vira um quadradinho.
- **Tema (`src/ghibli.css`):** o `Quadro.tsx` envolve a tela num `<div className="ghibli">`, e o CSS usa `:root:has(.ghibli)` para trocar as variáveis de cor da página inteira. Por isso o menu e o rodapé mudam junto, e as outras telas continuam como eram.
- **Fonte:** a Corben vem do pacote `@fontsource/corben` e é servida pelo próprio site. O navegador só baixa a fonte no quadro.
- **Totoro no arraste (`Quadro.tsx`):** o `onDragStart` chama `pegarCartao` (`src/arrastar.ts`), que troca a imagem de arraste do navegador por uma transparente e devolve a `carga`: a tarefa e onde o cartão foi pego. Com o estado `carga` preenchido, o `Carregador` aparece. Ele fica no `body` (`createPortal`) e segue o ponteiro pelo evento `dragover` do documento.
- **Depois de soltar:** o Totoro continua segurando o cartão até a API responder. Aí o cartão pousa na coluna nova e o personagem dela dá um pulo (estado `chegada`).
- **Falha ao mover:** antes, o aviso só era lido pelo leitor de tela. Agora aparece na tela, em cima do quadro.

## A lista de tarefas: o lado dos vilões

Pedido seguinte: a tela de Tarefas no mesmo estilo, com vilões no lugar dos personagens do quadro, e o Sem Rosto pegando o cartão.

| Onde | Filme | O que aparece |
| --- | --- | --- |
| Ao lado da busca | A Viagem de Chihiro | O Sem Rosto na ponte vermelha, oferecendo ouro, e as cabeças verdes da Yubaba |
| Arrastando um cartão | A Viagem de Chihiro | O Sem Rosto segura o cartão |
| Cartão "A fazer" | O Castelo Animado | A Bruxa das Terras Desoladas |
| Cartão "Em andamento" | Princesa Mononoke | Nago, o javali amaldiçoado |
| Cartão "Em revisão" | A Viagem de Chihiro | Yubaba |
| Cartão "Concluída" | O Reino dos Gatos | O Rei dos Gatos |
| Cartão sem status | A Viagem de Chihiro | As cabeças verdes |

- **Mesmo tema, outra paleta:** a lista usa o mesmo `.ghibli`, mais a classe `.ghibli-noite` (antes `.ghibli-viloes`), que troca as cores (ver "Paletas").
- **Arrastar na lista é novo:** a lista não tinha arrastar e soltar. Agora, ao arrastar um cartão, aparecem embaixo da tela quatro alvos, um por status, cada um com o seu vilão. Soltar o cartão em um alvo grava o status na API, com o mesmo `atualizarTarefa` do seletor. O alvo do status atual fica apagado e não aceita o cartão.
- **O mesmo carregador:** o `Carregador` recebe `quem="totoro"` no quadro e `quem="sem-rosto"` na lista. Como o cartão cobre o alvo embaixo do ponteiro, o destino aparece escrito no próprio cartão.
- **O vilão do cartão** fica num `<span>` ao lado do `CartaoTarefa`, dentro do `<li>`. O componente do cartão, que o quadro também usa, não mudou.

## Paletas

Pedido seguinte: a lista mais escura e uma paleta bem crua para Projetos.

| Tela | Classe | Paleta |
| --- | --- | --- |
| Quadro, o lado do bem | `.ghibli` | papel creme e verde |
| Tarefas, o lado do mal | `.ghibli-noite` | noite, com o dourado do ouro do Sem Rosto |
| Projetos, detalhes e página não encontrada | `.ghibli-noite` | a mesma noite da lista de tarefas (ver "Padrão noturno") |

- **Uma classe por tela:** cada uma troca as variáveis de cor com `:root:has(...)`. A lista também muda o `color-scheme` para `dark`, para os campos do navegador acompanharem.
- **Personagens no escuro:** os desenhos pretos (Sem Rosto, javali) ganham um contorno claro com `filter: drop-shadow`. Sem ele, sumiriam no fundo.
- **Imagens de fundo, testadas e retiradas:** o quadro e a lista chegaram a ter um quadro de filme ao fundo (commit `8aa5273`). Paradas e em baixa resolução, não ficaram boas, e saíram. O fundo voltou a ser a cor lisa da paleta.

## Padrão noturno

Pedido seguinte: a tela do projeto, e as outras parecidas, no mesmo padrão da lista de tarefas, com botões preenchidos. O papel cru de Projetos (`.ghibli-cru`) saiu.

- **Onde vale:** lista de tarefas, lista de projetos, detalhe do projeto, detalhe da tarefa e página não encontrada. Todas usam `.ghibli .ghibli-noite`. Os cadastros continuam com a cartomante e o quadro com o papel creme.
- **Botões preenchidos:** o principal é ouro maciço com brilho embaixo; o secundário (editar) é ouro translúcido com contorno, como a visão marcada no alternador; excluir (`.botao-perigo`) e "Tentar de novo" são vermelhos translúcidos. Ao passar o mouse, sobem 1px (menos para quem pede menos movimento).
- **Painel de dados:** a mesma folha escura dos cartões, rótulos pequenos em caixa alta. À direita fica um personagem: a cena do Sem Rosto no projeto, o vilão do status na tarefa.
- **Vilões compartilhados:** a lista de vilões por status saiu de `ListaTarefas.tsx` para `src/viloes.ts`, e o componente `VilaoDoStatus` escolhe o personagem. Os cartões de tarefa na tela do projeto agora também têm o vilão no canto.
- **Lista vazia:** `.ghibli-vazio`, uma folha tracejada com um personagem no lugar da linha de texto solta.
- **Sem piscar:** carregando, erro e não encontrado ficam dentro do mesmo tema, para a tela não trocar de cor enquanto a API responde.

## Telas de cadastro: a mesa da cartomante

Pedido seguinte: todas as telas de cadastro com campos de cartomante, e que os próximos cadastros continuem assim.

- **Onde vale:** nova tarefa, editar tarefa, novo projeto e editar projeto.
- **Só CSS (`src/cartomante.css`):** os componentes só ganharam o `import`. O tema liga com `:root:has(.pagina-formulario)`, então um cadastro novo que use `.pagina-formulario` e `.formulario` já nasce assim.
- **Cada campo é uma carta de tarô:** o `.campo` ganha moldura dourada dupla e um número em romanos no alto, feito com contador de CSS (`counter(carta, upper-roman)`). O texto alternativo vazio (`/ ''`) faz o leitor de tela ler só o rótulo do campo.
- **A mesa:** o `.formulario` é o veludo roxo. A bola de cristal e o Jiji (O Serviço de Entregas da Kiki) ficam em cima dela, em `::before` e `::after`, com SVGs de `src/assets/`.
- **Céu estrelado:** feito com degradês de um ponto só, sem imagem.
- **Prioridade:** o `<legend>` fica em cima da borda do `<fieldset>` e abriria um buraco na moldura da carta. Com `float`, ele entra para dentro.
- **Limite:** enquanto uma tela de edição carrega, ou mostra erro, o tema ainda não aparece, porque o formulário ainda não está na tela.

## Animação ao criar um projeto

Pedido seguinte: uma animação de mudança de tela ao criar um projeto.

- **O que acontece:** ao salvar um projeto novo, a luz da bola de cristal cobre a tela (0,55 s), a página do projeto entra por baixo e a luz some (0,5 s).
- **`src/transicao.ts`:** a função `trocarDeTelaComLuz` cria a cortina de luz como um elemento solto no `body`, e não como componente do React. A tela de cadastro some na navegação, e a animação tem que continuar depois dela.
- **Sem envio duplo:** o `salvar` do `NovoProjeto.tsx` espera a troca de tela antes de terminar. O formulário continua em "Salvando..." enquanto a luz cobre a tela, e um segundo Enter não cria outro projeto.
- **Menos movimento:** com "reduzir movimento" ligado no sistema, a tela troca direto, sem cortina.
- **Garantia por tempo:** com a aba em segundo plano o navegador segura as animações. Depois de 0,9 s a tela troca de qualquer jeito.
- **Só na criação de projeto.** A função recebe o que fazer na troca, então serve para outras telas.

### O brilho pequeno, em toda troca de tela

Pedido seguinte: algo parecido em toda mudança de tela, mais simples.

- **O que acontece:** o conteúdo entra subindo de leve (0,28 s) e três estrelinhas piscam no canto de cima dele, na cor de destaque da tela.
- **Quem chama:** o `Layout.tsx` já tinha um `useEffect` que roda quando a rota muda, para cuidar do foco. Ele passou a chamar também o `brilharNaTroca`, do mesmo `src/transicao.ts`.
- **Conteúdo com `element.animate`:** a animação do conteúdo usa a Web Animations API. É o jeito de dizer "anime agora" sem trocar classe e sem remontar a página, que perderia o estado dela.
- **Não soma com a luz grande:** ao criar um projeto, só a cortina de luz aparece.
- **Ao abrir o site** não há animação, só nas trocas. Com "reduzir movimento" ligado, também não.

## Onde o React entrou

- **Estado decide o que aparece:** não existe código de "mostrar o Totoro". Existe o estado `carga`, e o Totoro é renderizado enquanto ele não é `null`.
- **`useRef` no lugar de estado para a posição:** o `dragover` dispara dezenas de vezes por segundo. Guardar a posição em estado renderizaria o quadro inteiro a cada movimento. O `Carregador` escreve a posição direto no estilo do elemento, pelo `ref`.
- **`useEffect` com limpeza:** o ouvinte de `dragover` é registrado quando o Totoro aparece e removido quando ele some.
- **Atualização com função:** `setCarga((atual) => ...)` no `onDragEnd` lê o valor mais novo. O `drop` e o `dragend` chegam um atrás do outro, e o segundo não pode apagar o que o primeiro acabou de marcar.
- **Componentes como dados:** o objeto `filmes` guarda, para cada status, o nome do filme, a frase e o componente do personagem. A coluna só renderiza `<filme.Personagem />`.

## Acessibilidade

- Todos os desenhos têm `aria-hidden`: o leitor de tela não lê nenhum.
- O seletor de status do cartão continua igual, para quem não usa o mouse.
- O contraste de todos os textos da tela foi medido por script: nenhum ficou abaixo de 4,5:1.
- Nada se mexe sozinho por muito tempo: as animações são curtas ou só duram enquanto a pessoa arrasta. Com "reduzir movimento" ligado no sistema, nenhuma roda.

## Limites

- **Modo escuro do sistema:** o quadro e Projetos são sempre claros, e a lista é sempre escura. Os cadastros também são sempre escuros. As telas de detalhe seguem o sistema.
- **Celular:** arrastar com o dedo depende do navegador. O seletor de status funciona sempre.
- **Navegador sem `:has()`:** o quadro aparece com as cores de antes, só com os personagens.

## Como testar

1. `npm install`, `npm run api` e `npm run dev`.
2. Abra `/quadro`: cada coluna tem um filme e um personagem.
3. Arraste um cartão para outra coluna: o Totoro segura o cartão, a coluna de destino fica destacada e, ao soltar, o cartão pousa nela.
4. Busque `zzzz`: as colunas vazias mostram as bolinhas de fuligem.
5. Pare a API e arraste um cartão: aparece o aviso de que não foi possível mover.
6. Abra `/`: cada cartão tem o vilão do seu status. Arraste um cartão até um dos alvos que aparecem embaixo: o Sem Rosto leva o cartão e o status muda.
7. Abra `/projetos`: papel cru, sem personagens e sem imagem.
8. Abra `/tarefas/nova` e `/projetos/novo`: cada campo é uma carta numerada. Envie vazio para ver os erros dentro das cartas.
9. Em `/projetos/novo`, preencha e crie o projeto: a luz da bola de cristal cobre a tela e a página do projeto novo aparece.
10. Troque de tela pelo menu: o conteúdo entra subindo de leve e três estrelinhas piscam no canto.
