import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import '../App.css'


function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const username = user?.displayName || user?.email?.split('@')[0] || 'Admin'

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">MBOLO EATS</h2>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Add a New Restaurant and Menu Items
          </NavLink>
          <NavLink to="/edit" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            View and Edit Restaurants and Menus
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            View All Orders
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-greeting">Welcome, {username}</span>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
