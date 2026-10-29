import { Link, NavLink, Outlet, matchPath, useLocation } from 'react-router-dom'

function Layout() {
  const { pathname, search } = useLocation()

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

      <main>
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
