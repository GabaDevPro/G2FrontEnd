import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

function Layout() {
  const { pathname } = useLocation()

  // A lista fica em "/" e o detalhe em "/tarefas/:id": as duas são da seção Tarefas
  const emTarefas = pathname === '/' || pathname.startsWith('/tarefas')

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
          <NavLink to="/projetos">Projetos</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
