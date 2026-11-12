import { useEffect, useRef } from 'react'
import {
  Link,
  NavLink,
  NavigationType,
  Outlet,
  matchPath,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { brilharNaTroca } from '../transicao'

function Layout() {
  const { pathname, search, state } = useLocation()
  const tipoNavegacao = useNavigationType()
  const conteudo = useRef<HTMLElement>(null)
  const caminhoAnterior = useRef(pathname)

  // O navegador não recarrega a página ao trocar de rota: o link clicado some, o
  // foco cai no começo da página e o leitor de tela não percebe a tela nova. O
  // foco vai para o conteúdo, e o próximo Tab começa nele, sem repetir o menu.
  // Compara com o caminho anterior para não mexer no foco ao abrir o site
  useEffect(() => {
    if (caminhoAnterior.current === pathname) return
    caminhoAnterior.current = pathname

    // Toda troca de tela tem um brilho pequeno: o conteúdo entra subindo de
    // leve e três estrelinhas piscam no canto
    if (conteudo.current) brilharNaTroca(conteudo.current)

    // O alternador Lista | Quadro devolve o foco para ele mesmo
    if (tipoNavegacao === NavigationType.Push && state?.alternouVisao) return

    // O botão voltar (POP) mantém a rolagem que o navegador restaurou
    if (tipoNavegacao !== NavigationType.Pop) {
      window.scrollTo(0, 0)
    }

    conteudo.current?.focus({ preventScroll: true })
  }, [pathname, tipoNavegacao, state])

  // Telas de tarefa abertas pelo quadro trazem ?origem=quadro e pertencem à seção Quadro
  const veioDoQuadro = new URLSearchParams(search).get('origem') === 'quadro'

  // Compara como as rotas (matchPath), igual ao alternador: /quadro/ e /Quadro
  // também abrem o quadro. Com === o menu ficava sem nenhuma seção marcada.
  // A lista fica em "/" e o detalhe em "/tarefas/:id": as duas são da seção Tarefas
  const emTarefas =
    (matchPath('/', pathname) !== null ||
      matchPath({ path: '/tarefas', end: false }, pathname) !== null) &&
    !veioDoQuadro
  const emQuadro = matchPath('/quadro', pathname) !== null || veioDoQuadro

  return (
    <div className="layout">
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>

      <header className="topo">
        <Link to="/" className="marca">
          Gerenciador de Tarefas
        </Link>

        <nav className="menu" aria-label="Navegação principal">
          {/* Link comum em vez de NavLink: o NavLink só marcaria aria-current
              em "/" exato, e o leitor de tela não anunciaria a seção no detalhe */}
          <Link
            to="/"
            className={emTarefas ? 'active' : undefined}
            aria-current={emTarefas ? 'page' : undefined}
          >
            Tarefas
          </Link>
          <Link
            to="/quadro"
            className={emQuadro ? 'active' : undefined}
            aria-current={emQuadro ? 'page' : undefined}
          >
            Quadro
          </Link>
          <NavLink to="/projetos">Projetos</NavLink>
        </nav>
      </header>

      <main id="conteudo" ref={conteudo} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="rodape">
        <p>
          Feito por <strong>Caio e os Esquilos</strong> 🐿️ · Desenvolvimento
          Frontend 2026.2
        </p>
      </footer>
    </div>
  )
}

export default Layout
