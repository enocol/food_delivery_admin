import { NavLink, Outlet } from 'react-router-dom'
import '../App.css'

function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">MBOLO EATS</h2>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Add Restaurant
          </NavLink>
          <NavLink to="/edit" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Edit Data
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
