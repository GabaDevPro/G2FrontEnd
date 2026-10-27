import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

function Layout() {
  const { pathname, search } = useLocation()

  // Telas de tarefa abertas pelo quadro trazem ?origem=quadro e pertencem à seção Quadro
  const veioDoQuadro = new URLSearchParams(search).get('origem') === 'quadro'

  // A lista fica em "/" e o detalhe em "/tarefas/:id": as duas são da seção Tarefas
  const emTarefas =
    (pathname === '/' || pathname.startsWith('/tarefas')) && !veioDoQuadro
  const emQuadro = pathname === '/quadro' || veioDoQuadro

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
