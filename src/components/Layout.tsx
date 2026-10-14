import { NavLink, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="layout">
      <header className="topo">
        <strong className="marca">Gerenciador de Tarefas</strong>

        <nav className="menu">
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
