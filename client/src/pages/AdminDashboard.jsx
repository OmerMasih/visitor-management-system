import { useEffect, useState } from "react";
import VisitorBadge from "../components/VisitorBadge";
import DashboardSidebar from "../components/DashboardSidebar";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/visitors";

function AdminDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  // Fetch visitors
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load visitors.");
      }

      setVisitors(data.visitors || []);
    } catch (error) {
      console.error("Fetch visitors error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Request escort
  const requestEscort = async (visitorId) => {
    try {
      const response = await fetch(`${API_URL}/${visitorId}/escort-request`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not request escort.");
      }

      await fetchVisitors();
    } catch (error) {
      alert(error.message);
    }
  };

  // Assign escort
  const assignEscort = async (visitorId) => {
    const escortName = prompt("Enter the escort employee's name:");

    if (!escortName || !escortName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${visitorId}/escort`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          escortName: escortName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not assign escort.");
      }

      await fetchVisitors();
    } catch (error) {
      alert(error.message);
    }
  };

  // Start escort
  const startEscort = async (visitorId) => {
    try {
      const response = await fetch(`${API_URL}/${visitorId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Escort in Progress",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start escort.");
      }

      await fetchVisitors();
    } catch (error) {
      alert(error.message);
    }
  };

  // Check out visitor
  const checkoutVisitor = async (visitorId) => {
    const confirmed = window.confirm(
      "Are you sure you want to check out this visitor?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${visitorId}/checkout`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to check out visitor.");
      }

      await fetchVisitors();
    } catch (error) {
      alert(error.message);
    }
  };

  // Format date and time
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  // Filter visitors
  const filteredVisitors = visitors.filter((visitor) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      visitor.fullName?.toLowerCase().includes(search) ||
      visitor.company?.toLowerCase().includes(search) ||
      visitor.personToVisit?.toLowerCase().includes(search) ||
      visitor.department?.toLowerCase().includes(search) ||
      visitor.badgeNumber?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dashboard statistics
  const totalVisitors = visitors.length;

  const registeredVisitors = visitors.filter(
    (visitor) => visitor.status === "Registered",
  ).length;

  const waitingVisitors = visitors.filter(
    (visitor) => visitor.status === "Waiting for Department",
  ).length;

  const checkedOutVisitors = visitors.filter(
    (visitor) => visitor.status === "Checked Out",
  ).length;

  return (
    <div className="admin-layout">
      <DashboardSidebar />

      <main className="admin-main">
        <div className="admin-dashboard">
          {/* Dashboard Header */}

          <header className="dashboard-header">
            <div className="dashboard-welcome">
              <p className="welcome-label">ADMINISTRATION PORTAL</p>
              <h1>Welcome to Visitor Management</h1>
              <p>Monitor visitors, manage escorts, and track daily activity.</p>
            </div>

            <div className="dashboard-header-actions">
              <div className="current-date">
                <span>Today's Date</span>
                <strong>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </div>

              <button
                className="refresh-button"
                onClick={fetchVisitors}
                disabled={loading}
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>
          </header>

          {/* Dashboard Statistics */}
          <section className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Visitors</h3>
              <p>{totalVisitors}</p>
            </div>

            <div className="stat-card">
              <h3>Registered</h3>
              <p>{registeredVisitors}</p>
            </div>

            <div className="stat-card">
              <h3>Waiting for Department</h3>
              <p>{waitingVisitors}</p>
            </div>

            <div className="stat-card">
              <h3>Checked Out</h3>
              <p>{checkedOutVisitors}</p>
            </div>
          </section>

          {/* Search and Filter */}
          <section className="dashboard-controls">
            <input
              type="text"
              placeholder="Search name, company, department, or badge..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Waiting for Department">
                Waiting for Department
              </option>
              <option value="Escort Requested">Escort Requested</option>
              <option value="Escort Accepted">Escort Accepted</option>
              <option value="Escort in Progress">Escort in Progress</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </section>

          {error && <p className="error-message">{error}</p>}

          {/* Visitors Table */}
          <section className="table-wrapper">
            <table className="visitor-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Badge Number</th>
                  <th>Company</th>
                  <th>Person to Visit</th>
                  <th>Department</th>
                  <th>Purpose</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                  <th>Escort</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11">Loading visitors...</td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="11">No visitors found.</td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor._id}>
                      <td>{visitor.fullName}</td>

                      <td className="badge-number">
                        {visitor.badgeNumber || "Not assigned"}
                      </td>

                      <td>{visitor.company || "—"}</td>
                      <td>{visitor.personToVisit}</td>
                      <td>{visitor.department}</td>
                      <td>{visitor.purposeOfVisit}</td>
                      <td>{formatDate(visitor.timeIn)}</td>
                      <td>{formatDate(visitor.timeOut)}</td>

                      <td>
                        <span
                          className={`status-badge ${visitor.status
                            ?.toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {visitor.status}
                        </span>
                      </td>

                      <td>{visitor.escortName || "Not assigned"}</td>

                      <td className="action-buttons">
                        {visitor.status === "Registered" && (
                          <button onClick={() => requestEscort(visitor._id)}>
                            Request Escort
                          </button>
                        )}

                        {visitor.status === "Escort Requested" && (
                          <button onClick={() => assignEscort(visitor._id)}>
                            Assign Escort
                          </button>
                        )}

                        {visitor.status === "Escort Accepted" && (
                          <button onClick={() => startEscort(visitor._id)}>
                            Start Escort
                          </button>
                        )}

                        {visitor.status === "Escort in Progress" && (
                          <button onClick={() => checkoutVisitor(visitor._id)}>
                            Check Out
                          </button>
                        )}

                        {visitor.status === "Checked Out" && (
                          <span>Completed</span>
                        )}

                        {visitor.status === "Cancelled" && (
                          <span>Cancelled</span>
                        )}

                        <button
                          className="print-badge-button"
                          onClick={() => setSelectedVisitor(visitor)}
                        >
                          Print Badge
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {/* Dashboard Footer */}
          <footer className="dashboard-footer">
            Showing {filteredVisitors.length} of {totalVisitors} visitors
          </footer>

          {/* Print Badge Modal */}
          {selectedVisitor && (
            <VisitorBadge
              visitor={selectedVisitor}
              onClose={() => setSelectedVisitor(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
