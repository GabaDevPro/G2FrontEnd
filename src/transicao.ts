import './transicao.css'

// Troca de tela com a luz da bola de cristal: a luz cobre a tela a partir de
// `origem`, `trocar` roda com a tela coberta, e a luz some por cima da tela
// nova. A promessa termina quando `trocar` já rodou.
//
// A cortina é um elemento solto no body, e não um componente do React: a tela
// que chama some na navegação, e a animação tem que continuar depois dela
export function trocarDeTelaComLuz(
  trocar: () => void,
  origem?: { x: number; y: number }
): Promise<void> {
  return new Promise((resolver) => {
    let trocou = false

    function trocarUmaVez() {
      if (trocou) return

      trocou = true
      trocar()
      resolver()
    }

    // Quem pede menos movimento no sistema troca de tela direto
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      trocarUmaVez()
      return
    }

    const cortina = document.createElement('div')
    const estrela = document.createElement('span')

    cortina.className = 'cortina-de-luz'
    // É só enfeite: o leitor de tela não precisa saber dela
    cortina.setAttribute('aria-hidden', 'true')
    cortina.style.setProperty('--x', `${origem?.x ?? innerWidth / 2}px`)
    cortina.style.setProperty('--y', `${origem?.y ?? innerHeight / 2}px`)
    estrela.textContent = '✦'
    cortina.append(estrela)
    document.body.append(cortina)

    function sair() {
      trocarUmaVez()
      cortina.classList.add('cortina-saindo')
    }

    cortina.addEventListener('animationend', (evento) => {
      // A estrela também anima, e o evento dela sobe até aqui
      if (evento.target !== cortina) return

      if (evento.animationName === 'cortina-cobrir') sair()
      else cortina.remove()
    })

    // Garantia: com a aba em segundo plano o navegador segura a animação, e a
    // tela nova não pode depender dela para aparecer
    setTimeout(sair, 900)
    setTimeout(() => cortina.remove(), 2000)
  })
}
