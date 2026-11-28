import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import "./VisitorHistory.css";
import API_URL from "../config";

const VISITORS_API = `${API_URL}/api/visitors`;

// Authentication helper
const adminFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.assign("/admin/login");
    throw new Error("Please log in again.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    window.location.assign("/admin/login");
  }

  return response;
};

function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all visitor records
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminFetch(VISITORS_API);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load visitor history.");
      }

      setVisitors(data.visitors || []);
    } catch (error) {
      console.error("Visitor history error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Restore visitor to Dashboard
  const restoreVisitor = async (visitorId, visitorName) => {
    const confirmed = window.confirm(
      `Restore ${visitorName} to the Dashboard?`,
    );

    if (!confirmed) return;

    try {
      const response = await adminFetch(
        `${VISITORS_API}/${visitorId}/restore-to-dashboard`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to restore visitor.");
      }

      await fetchVisitors();
      alert("Visitor successfully restored to Dashboard.");
    } catch (error) {
      alert(error.message);
    }
  };

  // Permanently delete visitor
  const deleteVisitor = async (visitorId, visitorName) => {
    const confirmed = window.confirm(
      `PERMANENT DELETION

Are you sure you want to permanently delete ${visitorName}?

This record will also disappear from the Dashboard, Reports, and Analytics.

This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      const response = await adminFetch(`${VISITORS_API}/${visitorId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete visitor.");
      }

      await fetchVisitors();
      alert("Visitor record permanently deleted.");
    } catch (error) {
      alert(error.message);
    }
  };

  // Format date and time
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  // Search and filter records
  const filteredVisitors = visitors.filter((visitor) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      visitor.fullName?.toLowerCase().includes(search) ||
      visitor.badgeNumber?.toLowerCase().includes(search) ||
      visitor.company?.toLowerCase().includes(search) ||
      visitor.personToVisit?.toLowerCase().includes(search) ||
      visitor.department?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-layout">
      <DashboardSidebar />

      <main className="admin-main">
        <div className="visitor-history-page">
          {/* Header */}
          <header className="history-header">
            <div>
              <p className="history-label">RECORDS MANAGEMENT</p>
              <h1>Visitor History</h1>
              <p>
                Review visitor registrations, arrival times, departures, and
                escort assignments.
              </p>
            </div>

            <button
              className="history-refresh-button"
              onClick={fetchVisitors}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </header>

          {/* Summary Cards */}
          <section className="history-summary">
            <div className="history-stat-card">
              <span>Total Records</span>
              <strong>{visitors.length}</strong>
            </div>

            <div className="history-stat-card">
              <span>Checked Out</span>
              <strong>
                {
                  visitors.filter((visitor) => visitor.status === "Checked Out")
                    .length
                }
              </strong>
            </div>

            <div className="history-stat-card">
              <span>Currently Active</span>
              <strong>
                {
                  visitors.filter(
                    (visitor) =>
                      visitor.status !== "Checked Out" &&
                      visitor.status !== "Cancelled",
                  ).length
                }
              </strong>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="history-controls">
            <input
              type="text"
              placeholder="Search visitor, badge, company..."
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

          {error && <p className="history-error">{error}</p>}

          {/* Visitor History Table */}
          <section className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Badge Number</th>
                  <th>Company</th>
                  <th>Identification Type</th>
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
                    <td colSpan="12">Loading visitor records...</td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="12">No visitor records found.</td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor._id}>
                      <td>{visitor.fullName}</td>

                      <td>{visitor.badgeNumber || "Not assigned"}</td>

                      <td>{visitor.company || "—"}</td>

                      <td>
                        {Array.isArray(visitor.identificationTypes)
                          ? visitor.identificationTypes.join(", ")
                          : visitor.identificationTypes || "—"}
                      </td>

                      <td>{visitor.personToVisit}</td>

                      <td>{visitor.department}</td>

                      <td>{visitor.purposeOfVisit}</td>

                      <td>{formatDate(visitor.timeIn)}</td>

                      <td>{formatDate(visitor.timeOut)}</td>

                      <td>
                        <span
                          className={`history-status ${visitor.status
                            ?.toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {visitor.status}
                        </span>
                      </td>

                      <td>{visitor.escortName || "Not assigned"}</td>

                      <td>
                        {/* Show Restore only for hidden visitors */}
                        {visitor.hiddenFromDashboard && (
                          <button
                            type="button"
                            className="restore-visitor-button"
                            onClick={() =>
                              restoreVisitor(visitor._id, visitor.fullName)
                            }
                          >
                            Restore
                          </button>
                        )}

                        <button
                          type="button"
                          className="permanent-delete-button"
                          onClick={() =>
                            deleteVisitor(visitor._id, visitor.fullName)
                          }
                        >
                          Delete Permanently
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {/* Footer */}
          <footer className="history-footer">
            Showing {filteredVisitors.length} of {visitors.length} records
          </footer>
        </div>
      </main>
    </div>
  );
}

export default VisitorHistory;
