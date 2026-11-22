import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/visitors";

function AdminDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchVisitors = async () => {
    try {
      setError("");
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load visitors");
      }

      setVisitors(data.visitors || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const requestEscort = async (visitorId) => {
    try {
      const response = await fetch(`${API_URL}/${visitorId}/escort-request`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await fetchVisitors();
    } catch (error) {
      setError(error.message);
    }
  };

  const assignEscort = async (visitorId) => {
    const escortName = window.prompt("Enter employee name:");

    if (!escortName || !escortName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${visitorId}/escort`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ escortName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await fetchVisitors();
    } catch (error) {
      setError(error.message);
    }
  };

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
        throw new Error(data.message);
      }

      await fetchVisitors();
    } catch (error) {
      setError(error.message);
    }
  };

  const checkoutVisitor = async (visitorId) => {
    if (!window.confirm("Confirm visitor checkout?")) return;

    try {
      const response = await fetch(`${API_URL}/${visitorId}/checkout`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await fetchVisitors();
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const filteredVisitors = visitors.filter((visitor) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      visitor.fullName?.toLowerCase().includes(searchText) ||
      visitor.company?.toLowerCase().includes(searchText) ||
      visitor.personToVisit?.toLowerCase().includes(searchText) ||
      visitor.department?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Security Admin Dashboard</h1>
          <p>Visitor Registration and Escort Management</p>
        </div>

        <button onClick={fetchVisitors} className="refresh-button">
          ↻ Refresh Visitors
        </button>
      </header>

      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Visitors</h3>
          <p>{visitors.length}</p>
        </div>

        <div className="stat-card">
          <h3>Registered</h3>
          <p>{visitors.filter((v) => v.status === "Registered").length}</p>
        </div>

        <div className="stat-card">
          <h3>Waiting for Department</h3>
          <p>
            {
              visitors.filter((v) => v.status === "Waiting for Department")
                .length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Checked Out</h3>
          <p>{visitors.filter((v) => v.status === "Checked Out").length}</p>
        </div>
      </section>

      <section className="visitor-section">
        <div className="section-heading">
          <div>
            <h2>Visitor Records</h2>
            <p>View and monitor registered visitors.</p>
          </div>
        </div>

        <div className="visitor-controls">
          <input
            type="search"
            placeholder="Search by name, company, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
        </div>

        {error && <p className="dashboard-error">{error}</p>}

        {loading ? (
          <p className="dashboard-message">Loading visitors...</p>
        ) : filteredVisitors.length === 0 ? (
          <p className="dashboard-message">No visitors found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="visitor-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Company</th>
                  <th>Person to Visit</th>
                  <th>Department</th>
                  <th>Purpose</th>
                  <th>Time In</th>
                  <th>Status</th>
                  <th>Escort</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor._id}>
                    <td>{visitor.fullName}</td>
                    <td>{visitor.company || "—"}</td>
                    <td>{visitor.personToVisit}</td>
                    <td>{visitor.department}</td>
                    <td>{visitor.purposeOfVisit}</td>
                    <td>{formatDate(visitor.timeIn)}</td>
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

                    <td>{/* Escort action buttons will go here */}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="record-count">
          Showing {filteredVisitors.length} of {visitors.length} visitors
        </p>
      </section>
    </main>
  );
}

export default AdminDashboard;
