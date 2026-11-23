import { NavLink } from "react-router-dom";
import "./DashboardSidebar.css";

function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <h2>Visitor System</h2>
        <p>Management Portal</p>
      </div>

      <nav className="sidebar-navigation">
        <p className="sidebar-label">MAIN MENU</p>

        <NavLink to="/admin" className="sidebar-link">
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/" className="sidebar-link">
          <span>＋</span>
          Visitor Registration
        </NavLink>

        <p className="sidebar-label">COMING SOON</p>

        <div className="sidebar-disabled">
          <span>◷</span>
          Visitor History
        </div>

        <div className="sidebar-disabled">
          <span>▤</span>
          Reports
        </div>

        <div className="sidebar-disabled">
          <span>⚙</span>
          Settings
        </div>
      </nav>

      <div className="sidebar-footer">Visitor Management System</div>
    </aside>
  );
}

export default DashboardSidebar;
