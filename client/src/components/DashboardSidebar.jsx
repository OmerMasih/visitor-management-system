import { NavLink, useNavigate } from "react-router-dom";
import "./DashboardSidebar.css";

function DashboardSidebar() {
  const navigate = useNavigate();

  // Admin logout
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");

    navigate("/admin/login", { replace: true });
  };

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

        <NavLink to="/register" className="sidebar-link">
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

        <NavLink to="/admin/analytics" className="sidebar-link">
          <span>📊</span>
          Analytics
        </NavLink>

        <p className="sidebar-label">COMING SOON</p>

        <div className="sidebar-disabled">
          <span>⚙</span>
          Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <p>Visitor Management System</p>

        <button
          type="button"
          className="sidebar-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
