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

        <NavLink to="/admin" end className="sidebar-link">
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/" end className="sidebar-link">
          <span>＋</span>
          Visitor Registration
        </NavLink>

        <NavLink to="/admin/history" className="sidebar-link">
          <span>◷</span>
          Visitor History
        </NavLink>

        <NavLink to="/admin/reports" className="sidebar-link">
          <span>▤</span>
          Reports
        </NavLink>

        <p className="sidebar-label">COMING SOON</p>

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
