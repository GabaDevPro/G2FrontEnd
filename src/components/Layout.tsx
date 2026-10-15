import { Link, NavLink, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="layout">
      <header className="topo">
        <Link to="/" className="marca">
          Gerenciador de Tarefas
        </Link>

        <nav className="menu" aria-label="Navegação principal">
          <NavLink to="/" end>
            Tarefas
          </NavLink>
          <NavLink to="/projetos">Projetos</NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}

export default Layout
