import { useEffect, useRef } from 'react'
import {
  Link,
  NavigationType,
  matchPath,
  useLocation,
  useNavigationType,
} from 'react-router-dom'

// Ícones só de enfeite: o texto do link já diz qual é a visão

function IconeLista() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M8 5h9M8 10h9M8 15h9" />
      <circle cx="3.5" cy="5" r="0.6" />
      <circle cx="3.5" cy="10" r="0.6" />
      <circle cx="3.5" cy="15" r="0.6" />
    </svg>
  )
}

function IconeQuadro() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="2.5" y="3" width="4" height="14" rx="1" />
      <rect x="8" y="3" width="4" height="10" rx="1" />
      <rect x="13.5" y="3" width="4" height="6" rx="1" />
    </svg>
  )
}

// As duas visões das tarefas. A busca e os filtros ficam no FiltrosContext,
// fora das rotas, então continuam aplicados ao trocar de uma para a outra
const visoes = [
  { caminho: '/', rotulo: 'Lista', Icone: IconeLista },
  { caminho: '/quadro', rotulo: 'Quadro', Icone: IconeQuadro },
]

function AlternarVisao() {
  const { pathname, state } = useLocation()
  const tipoNavegacao = useNavigationType()
  const linkAtual = useRef<HTMLAnchorElement>(null)

  // Cada visão tem o seu alternador, então o link clicado some junto com a tela
  // antiga e o foco iria para o começo da página. Quem trocou de visão por aqui
  // volta para o link da visão nova. Só num clique (PUSH): F5 e o botão voltar
  // do navegador são POP e não mexem no foco
  useEffect(() => {
    if (tipoNavegacao === NavigationType.Push && state?.alternouVisao) {
      linkAtual.current?.focus()
    }
  }, [tipoNavegacao, state])

  return (
    <nav className="alternar-visao" aria-label="Visão das tarefas">
      {visoes.map(({ caminho, rotulo, Icone }) => {
        // Compara como as rotas: /quadro/ e /Quadro também abrem o quadro
        const atual = matchPath(caminho, pathname) !== null

        return (
          <Link
            key={caminho}
            to={caminho}
            state={{ alternouVisao: true }}
            ref={atual ? linkAtual : undefined}
            aria-current={atual ? 'page' : undefined}
          >
            <Icone />
            {rotulo}
          </Link>
        )
      })}
    </nav>
  )
}

export default AlternarVisao
