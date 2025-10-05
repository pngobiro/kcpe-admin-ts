import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">KCPE Admin</h1>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end>
                📊 Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/courses" className="nav-link">
                📚 Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/topics" className="nav-link">
                📖 Topics
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
