import { NavLink, useNavigate } from "react-router-dom";
import "./DashboardSidebar.css";

function DashboardSidebar() {
  const navigate = useNavigate();

  // Get logged-in user information
  let user = null;

  try {
    user = JSON.parse(sessionStorage.getItem("adminUser"));
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "admin";

  // Logout
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

        {/* Administrator-only navigation */}
        {isAdmin && (
          <>
            <p className="sidebar-label">ADMINISTRATION</p>
            <NavLink to="/admin/employees" className="sidebar-link">
              <span>👥</span>
              Employee Management
            </NavLink>
            <NavLink to="/admin/settings" className="sidebar-link">
              <span>⚙</span>
              Admin Settings
            </NavLink>
          </>
        )}
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
