import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import "./EmployeeManagement.css";
import API_URL from "../config";

function EmployeeManagement() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => sessionStorage.getItem("adminToken");

  // Load employee accounts
  const fetchEmployees = async () => {
    const token = getToken();

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/auth/employees/${employee._id}/reset-password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load employees.");
      }

      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Activate or deactivate employee
  const handleStatusChange = async (employee) => {
    const currentlyActive = employee.isActive !== false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        currentlyActive ? "deactivate" : "activate"
      } ${employee.username}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/employees/${employee._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            isActive: !currentlyActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update account.");
      }

      setMessage(data.message);
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  // Reset employee password
  const handlePasswordReset = async (employee) => {
    const newPassword = window.prompt(
      `Enter a new password for ${employee.username} (at least 12 characters):`,
    );

    if (newPassword === null) return;

    if (newPassword.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    const confirmed = window.confirm(
      `Reset the password for ${employee.username}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/employees/${employee._id}/reset-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  // Search employees
  const filteredEmployees = employees.filter((employee) =>
    employee.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="employee-management-layout">
      <DashboardSidebar />

      <main className="employee-management-content">
        <header className="employee-management-header">
          <div>
            <h1>Employee Management</h1>
            <p>Manage employee accounts and access.</p>
          </div>

          <button onClick={fetchEmployees} className="refresh-button">
            Refresh
          </button>
        </header>

        <section className="employee-management-card">
          <div className="employee-management-summary">
            <div>
              <h3>{employees.length}</h3>
              <p>Total Employees</p>
            </div>

            <div>
              <h3>{employees.filter((e) => e.isActive !== false).length}</h3>
              <p>Active Accounts</p>
            </div>

            <div>
              <h3>{employees.filter((e) => e.isActive === false).length}</h3>
              <p>Deactivated Accounts</p>
            </div>
          </div>

          <input
            className="employee-search"
            type="text"
            placeholder="Search employees by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {error && <div className="employee-error">{error}</div>}
          {message && <div className="employee-success">{message}</div>}

          {loading ? (
            <p>Loading employee accounts...</p>
          ) : filteredEmployees.length === 0 ? (
            <p>No employee accounts found.</p>
          ) : (
            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => {
                    const active = employee.isActive !== false;

                    return (
                      <tr key={employee._id}>
                        <td>{employee.username}</td>
                        <td>Employee</td>
                        <td>
                          <span
                            className={
                              active
                                ? "employee-status active"
                                : "employee-status inactive"
                            }
                          >
                            {active ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td>
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="employee-actions">
                            <button
                              className="employee-action-button"
                              onClick={() => handleStatusChange(employee)}
                            >
                              {active ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              className="employee-reset-button"
                              onClick={() => handlePasswordReset(employee)}
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default EmployeeManagement;
