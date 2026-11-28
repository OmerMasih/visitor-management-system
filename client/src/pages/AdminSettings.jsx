import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import "./AdminSettings.css";
import API_URL from "../config";

function AdminSettings() {
  const navigate = useNavigate();

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Create employee states
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Get administrator token
  const getToken = () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return null;
    }

    return token;
  };

  // Change administrator password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 12) {
      setPasswordError("New password must be at least 12 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Choose a password different from your current one.");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setPasswordLoading(true);

      const response = await fetch(`${API_URL}/api/auth/create-admin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswordMessage("Password changed successfully. Please log in again.");

      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUser");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || "Something went wrong.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Create employee account
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    setAdminMessage("");
    setAdminError("");

    if (adminUsername.trim().length < 3) {
      setAdminError("Username must contain at least 3 characters.");
      return;
    }

    if (adminPassword.length < 12) {
      setAdminError("Password must be at least 12 characters.");
      return;
    }

    if (adminPassword !== confirmAdminPassword) {
      setAdminError("Passwords do not match.");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setAdminLoading(true);

      const response = await fetch(`${API_URL}/api/auth/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to create employee account.");
      }

      setAdminMessage(
        `Employee account "${data.user.username}" created successfully.`,
      );

      setAdminUsername("");
      setAdminPassword("");
      setConfirmAdminPassword("");
    } catch (err) {
      setAdminError(err.message || "Something went wrong.");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="admin-settings-layout">
      <DashboardSidebar />

      <main className="admin-settings-content">
        <div className="settings-header">
          <h1>Admin Settings</h1>
          <p>Manage administrator security and employee accounts.</p>
        </div>

        {/* CHANGE PASSWORD */}
        <section className="settings-card">
          <h2>Change Password</h2>

          <p className="settings-description">
            Update your administrator password to help protect your account.
          </p>

          {passwordError && (
            <div className="settings-error">{passwordError}</div>
          )}

          {passwordMessage && (
            <div className="settings-success">{passwordMessage}</div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="settings-form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
              />
              <small>Use at least 12 characters.</small>
            </div>

            <div className="settings-form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="settings-submit-button"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        {/* CREATE EMPLOYEE ACCOUNT */}
        <section className="settings-card">
          <h2>Create Employee Account</h2>

          <p className="settings-description">
            Create an employee login account. Employees cannot access
            administrator account settings.
          </p>

          {adminError && <div className="settings-error">{adminError}</div>}

          {adminMessage && (
            <div className="settings-success">{adminMessage}</div>
          )}

          <form onSubmit={handleCreateAdmin}>
            <div className="settings-form-group">
              <label htmlFor="adminUsername">Employee Username</label>
              <input
                id="adminUsername"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter username"
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9._-]+"
                title="Use letters, numbers, dots, underscores, or hyphens."
                required
                autoComplete="off"
              />
              <small>
                3–30 characters. Letters, numbers, dots, underscores, and
                hyphens.
              </small>
            </div>

            <div className="settings-form-group">
              <label htmlFor="adminPassword">Employee Password</label>
              <input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                minLength={12}
                required
                autoComplete="new-password"
              />
              <small>Use at least 12 characters.</small>
            </div>

            <div className="settings-form-group">
              <label htmlFor="confirmAdminPassword">
                Confirm Employee Password
              </label>
              <input
                id="confirmAdminPassword"
                type="password"
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                placeholder="Confirm password"
                minLength={12}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="settings-submit-button"
              disabled={adminLoading}
            >
              {adminLoading ? "Creating Account..." : "Create Employee Account"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdminSettings;
